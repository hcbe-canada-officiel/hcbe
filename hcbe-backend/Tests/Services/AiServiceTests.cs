using System.Text.Json;
using FluentAssertions;
using HcbeApi.Data;
using HcbeApi.Models;
using HcbeApi.Services;
using HcbeApi.Tests.Helpers;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace HcbeApi.Tests.Services;

public sealed class AiServiceTests : IDisposable
{
    private readonly ApplicationDbContext context = TestDbContextFactory.CreateInMemoryContext();

    [Fact]
    public async Task GenericQuestion_UsesApprovedPlatformSource_WhenDatabaseIsEmpty()
    {
        var provider = new RecordingAiProvider();
        var service = CreateService(provider);

        var response = await service.AskAsync(null,
            new AiAssistantRequest("What do you offer?", "en", true, "/"),
            CancellationToken.None);

        response.Success.Should().BeTrue();
        response.Data!.Sources.Should().ContainSingle(source =>
            source.Id == "hcbe-services" && source.Url == "/services");
        provider.LastInput.Should().Contain("HCBE community services");
        context.AuditLogs.Should().ContainSingle(log => log.Action == "AiAssistantGenerated");
    }

    [Fact]
    public async Task PublishedCmsContent_IsAvailableAsAnApprovedSource()
    {
        context.CmsContentItems.Add(new CmsContentItem
        {
            Key = "services.youth-program",
            Page = "services",
            Section = "programs",
            ContentType = "text",
            Label = "Youth program",
            PublishedValueFr = "Afrojeunesse accompagne les jeunes de la communauté.",
            PublishedValueEn = "Afrojeunesse supports young people in the community.",
            IsPublished = true,
            PublishedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
        var provider = new RecordingAiProvider();
        var service = CreateService(provider);

        var response = await service.AskAsync(null,
            new AiAssistantRequest("What is Afrojeunesse?", "en", true, "/services"),
            CancellationToken.None);

        response.Success.Should().BeTrue();
        response.Data!.Sources.Should().ContainSingle(source =>
            source.Title == "Youth program" && source.Url == "/services");
        provider.LastInput.Should().Contain("Afrojeunesse supports young people");
    }

    private AiService CreateService(IAiProvider provider) => new(
        context,
        provider,
        Options.Create(new AiOptions
        {
            Enabled = true,
            ApiKey = "test-key",
            Model = "test-model"
        }),
        NullLogger<AiService>.Instance);

    public void Dispose() => context.Dispose();

    private sealed class RecordingAiProvider : IAiProvider
    {
        public bool IsConfigured => true;
        public string ProviderName => "Test";
        public string Model => "test-model";
        public string LastInput { get; private set; } = string.Empty;

        public Task<JsonDocument> GenerateStructuredAsync(
            string instructions,
            IReadOnlyList<AiInputPart> input,
            string schemaName,
            string schemaJson,
            CancellationToken cancellationToken)
        {
            LastInput = string.Join("\n", input.Select(part => part.Text));
            return Task.FromResult(JsonDocument.Parse("""
                {"answer":"HCBE offers community services.","suggestedAction":null,"sourceIndices":[1],"requiresHumanHelp":false}
                """));
        }
    }
}
