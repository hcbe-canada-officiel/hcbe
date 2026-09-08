using System.ComponentModel.DataAnnotations;

namespace HcbeApi.Models;

public sealed record AiStatusDto(
    bool Enabled,
    bool Configured,
    string Provider,
    string Model,
    IReadOnlyDictionary<string, bool> Features);

public sealed record AiAssistantRequest(
    [Required, StringLength(1200, MinimumLength = 3)] string Question,
    [Required] string Language,
    bool PrivacyAccepted,
    string? CurrentPath = null);

public sealed record AiSourceDto(string Id, string Type, string Title, string? Excerpt, string Url);
public sealed record AiAssistantResponse(string Answer, string? SuggestedAction, IReadOnlyList<AiSourceDto> Sources, bool RequiresHumanHelp);

public sealed record AiWritingRequest(
    [Required, StringLength(40)] string Action,
    [Required, StringLength(40)] string Purpose,
    [Required, StringLength(12000, MinimumLength = 1)] string SourceText,
    [Required] string Language,
    [StringLength(1000)] string? Context,
    bool PrivacyAccepted);

public sealed record AiWritingResponse(string Title, string Body, string? Excerpt, string Language, IReadOnlyList<string> ReviewNotes);

public sealed record AiEventExtractionRequest(
    [StringLength(12000)] string? SourceText,
    [Required] string Language,
    bool PrivacyAccepted);

public sealed record AiEventDraft(
    string Title,
    string TitleEn,
    string Description,
    string DescriptionEn,
    DateTimeOffset? StartsAt,
    DateTimeOffset? EndsAt,
    string TimeZone,
    string Location,
    string LocationEn,
    string Type,
    string Format,
    string Zone,
    int? Capacity,
    DateTimeOffset? RegistrationDeadline,
    string MeetingLink,
    string RegistrationUrl,
    IReadOnlyList<string> Speakers,
    IReadOnlyList<string> Organizers,
    IReadOnlyList<string> Warnings,
    double Confidence);

public sealed record AiRoutingSuggestion(
    string Category,
    string Priority,
    Guid? AssociationId,
    string? AssociationName,
    string Rationale,
    double Confidence,
    IReadOnlyList<string> ReviewFlags);
