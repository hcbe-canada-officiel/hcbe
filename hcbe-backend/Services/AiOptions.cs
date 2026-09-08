namespace HcbeApi.Services;

public sealed class AiOptions
{
    public const string SectionName = "Ai";
    public bool Enabled { get; set; }
    public string Provider { get; set; } = "OpenAI";
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-5.6-luna";
    public int TimeoutSeconds { get; set; } = 45;
    public int MaxOutputTokens { get; set; } = 1800;
    public AiFeatureOptions Features { get; set; } = new();
}

public sealed class AiFeatureOptions
{
    public bool Assistant { get; set; } = true;
    public bool WritingCopilot { get; set; } = true;
    public bool EventExtraction { get; set; } = true;
    public bool ServiceRouting { get; set; } = true;
}
