using System.Text.Json;

namespace HcbeApi.Services;

public sealed record AiInputPart(string Type, string? Text = null, string? DataUrl = null, string? FileName = null);

public interface IAiProvider
{
    bool IsConfigured { get; }
    string ProviderName { get; }
    string Model { get; }
    Task<JsonDocument> GenerateStructuredAsync(
        string instructions,
        IReadOnlyList<AiInputPart> input,
        string schemaName,
        string schemaJson,
        CancellationToken cancellationToken);
}
