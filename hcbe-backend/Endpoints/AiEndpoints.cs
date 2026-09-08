using HcbeApi.Helpers;
using HcbeApi.Models;
using HcbeApi.Services;

namespace HcbeApi.Endpoints;

public static class AiEndpoints
{
    public static void MapAiEndpoints(this WebApplication app)
    {
        app.MapGet("/api/ai/status", (IAiService service) => Results.Ok(ApiResponse<AiStatusDto>.SuccessResponse(service.GetStatus())))
            .WithTags("AI assistance")
            .AllowAnonymous();

        app.MapPost("/api/ai/assistant", async (AiAssistantRequest request, HttpContext http, IAiService service, CancellationToken cancellationToken) =>
                (await service.AskAsync(http.GetUserId(), request, cancellationToken)).HandleServiceResponse())
            .WithTags("AI assistance")
            .AllowAnonymous()
            .RequireRateLimiting("AiPublic");

        var admin = app.MapGroup("/api/admin/ai")
            .WithTags("AI administration")
            .RequireAuthorization()
            .RequireRateLimiting("AiAdmin");

        admin.MapPost("/writing", async (AiWritingRequest request, HttpContext http, IAiService service, CancellationToken cancellationToken) =>
        {
            if (!http.HasPermission(AdminPermissions.AiUse)) return Results.Forbid();
            return http.GetUserId() is Guid userId
                ? (await service.WriteAsync(userId, request, cancellationToken)).HandleServiceResponse()
                : Results.Unauthorized();
        });

        admin.MapPost("/events/extract", async (HttpRequest request, HttpContext http, IAiService service, CancellationToken cancellationToken) =>
        {
            if (!http.HasPermission(AdminPermissions.AiUse) || !http.HasPermission(AdminPermissions.EventsManage)) return Results.Forbid();
            if (http.GetUserId() is not Guid userId) return Results.Unauthorized();
            if (!request.HasFormContentType) return Results.BadRequest(ApiResponse<AiEventDraft>.ErrorResponse("Request must be multipart/form-data"));
            var form = await request.ReadFormAsync(cancellationToken);
            var file = form.Files["file"];
            byte[]? bytes = null;
            if (file is { Length: > 0 })
            {
                if (file.Length > 10 * 1024 * 1024)
                    return Results.BadRequest(ApiResponse<AiEventDraft>.ErrorResponse("The file must be 10 MB or smaller."));
                await using var stream = new MemoryStream();
                await file.CopyToAsync(stream, cancellationToken);
                bytes = stream.ToArray();
            }
            var extractionRequest = new AiEventExtractionRequest(
                form["sourceText"].FirstOrDefault(),
                form["language"].FirstOrDefault() ?? "fr",
                bool.TryParse(form["privacyAccepted"].FirstOrDefault(), out var accepted) && accepted);
            return (await service.ExtractEventAsync(userId, extractionRequest, bytes, file?.ContentType, file?.FileName, cancellationToken)).HandleServiceResponse();
        }).DisableAntiforgery();

        admin.MapPost("/service-cases/{id:guid}/route", async (Guid id, AiRoutingRequest request, HttpContext http, IAiService service, CancellationToken cancellationToken) =>
        {
            if (!http.HasPermission(AdminPermissions.AiUse) || !http.HasPermission(AdminPermissions.ServiceCasesManage)) return Results.Forbid();
            return http.GetUserId() is Guid userId
                ? (await service.SuggestRouteAsync(userId, id, request.Language, request.PrivacyAccepted, cancellationToken)).HandleServiceResponse()
                : Results.Unauthorized();
        });
    }
}

public sealed record AiRoutingRequest(string Language, bool PrivacyAccepted);
