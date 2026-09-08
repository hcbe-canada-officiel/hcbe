using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using HcbeApi.Helpers;
using HcbeApi.Models;

namespace HcbeApi.Tests.Integration;

public sealed class AiEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient client;

    public AiEndpointsTests(CustomWebApplicationFactory factory) => client = factory.CreateClient();

    [Fact]
    public async Task Status_IsPublicAndDisabledWithoutAConfiguredProvider()
    {
        var response = await client.GetAsync("/api/ai/status");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<AiStatusDto>>();
        payload!.Success.Should().BeTrue();
        payload.Data!.Enabled.Should().BeFalse();
        payload.Data.Features.Values.Should().OnlyContain(value => !value);
    }

    [Fact]
    public async Task AdministrativeCopilot_RequiresAuthentication()
    {
        var response = await client.PostAsJsonAsync("/api/admin/ai/writing", new AiWritingRequest(
            "improve", "event", "Community event", "en", null, true));
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
