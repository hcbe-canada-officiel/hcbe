using HcbeApi.Helpers;
using HcbeApi.Models;

namespace HcbeApi.Services;

public interface IAiService
{
    AiStatusDto GetStatus();
    Task<ApiResponse<AiAssistantResponse>> AskAsync(Guid? userId, AiAssistantRequest request, CancellationToken cancellationToken);
    Task<ApiResponse<AiWritingResponse>> WriteAsync(Guid userId, AiWritingRequest request, CancellationToken cancellationToken);
    Task<ApiResponse<AiEventDraft>> ExtractEventAsync(Guid userId, AiEventExtractionRequest request, byte[]? fileBytes, string? contentType, string? fileName, CancellationToken cancellationToken);
    Task<ApiResponse<AiRoutingSuggestion>> SuggestRouteAsync(Guid userId, Guid serviceCaseId, string language, bool privacyAccepted, CancellationToken cancellationToken);
}
