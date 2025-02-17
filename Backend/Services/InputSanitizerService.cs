using System;
using System.Text.RegularExpressions;

namespace Backend.Services;

public class InputSanitizerService
{
    private readonly string[] _dangerousChars = new[] { "<", ">", "\\", "/", "?", "*", "|", ":", "`", "@", "%", "&", "#", "$" };

    public string Sanitize(string input)
    {
        foreach (var charToRemove in _dangerousChars)
        {
            input = input.Replace(charToRemove, string.Empty);
        }
        return input.Trim();
    }
}