using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Linq;
using Microsoft.Extensions.Options;

namespace HcbeApi.Services;

public sealed class OpenAiProvider(IHttpClientFactory clients, IOptions<AiOptions> configuredOptions, ILogger<OpenAiProvider> logger) : IAiProvider
{
    private readonly AiOptions options = configuredOptions.Value;
    public bool IsConfigured => options.Enabled && !string.IsNullOrWhiteSpace(options.ApiKey);
    public string ProviderName => options.Provider;
    public string Model => options.Model;

    public async Task<JsonDocument> GenerateStructuredAsync(string instructions, IReadOnlyList<AiInputPart> input, string schemaName, string schemaJson, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new InvalidOperationException("AI features are not configured.");
        using var schema = JsonDocument.Parse(schemaJson);
        using var request = new HttpRequestMessage(HttpMethod.Post, "responses");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);
        request.Content = JsonContent.Create(new
        {
            model = options.Model,
            store = false,
            instructions,
            input = new[] { new { role = "user", content = BuildContent(input) } },
            max_output_tokens = Math.Clamp(options.MaxOutputTokens, 400, 4000),
            text = new { format = new { type = "json_schema", name = schemaName, strict = true, schema = schema.RootElement } }
        });

        var client = clients.CreateClient("OpenAI");
        using var response = await client.SendAsync(request, cancellationToken);
        var responseText = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("OpenAI request failed with status {StatusCode}; response body omitted.", (int)response.StatusCode);
            throw new InvalidOperationException("The AI provider could not complete the request.");
        }

        using var envelope = JsonDocument.Parse(responseText);
        var outputText = ExtractOutputText(envelope.RootElement);
        if (string.IsNullOrWhiteSpace(outputText)) throw new InvalidOperationException("The AI provider returned an empty result.");
        return JsonDocument.Parse(outputText);
    }

    private static object[] BuildContent(IReadOnlyList<AiInputPart> input)
    {
        var content = new List<object>(input.Count);
        foreach (var part in input)
        {
            content.Add(part.Type switch
            {
                "image" => new Dictionary<string, object?> { ["type"] = "input_image", ["image_url"] = part.DataUrl, ["detail"] = "high" },
                "file" => new Dictionary<string, object?> { ["type"] = "input_file", ["filename"] = part.FileName, ["file_data"] = part.DataUrl },
                _ => new Dictionary<string, object?> { ["type"] = "input_text", ["text"] = part.Text }
            });
        }
        return content.ToArray();
    }

    private static string? ExtractOutputText(JsonElement root)
    {
        if (root.TryGetProperty("output_text", out var shortcut) && shortcut.ValueKind == JsonValueKind.String) return shortcut.GetString();
        if (!root.TryGetProperty("output", out var output) || output.ValueKind != JsonValueKind.Array) return null;
        foreach (var item in output.EnumerateArray())
        {
            if (!item.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array) continue;
            foreach (var part in content.EnumerateArray())
            {
                if (part.TryGetProperty("type", out var type) && type.GetString() == "output_text" && part.TryGetProperty("text", out var text))
                    return text.GetString();
            }
        }
        return null;
    }
}
