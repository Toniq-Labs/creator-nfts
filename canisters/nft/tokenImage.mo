import Text "mo:base/Text";
import ImageAssets "imageAssets";

// Dynamically generates SVG image strings based on token data

module TokenImage {
    public func getSvgString(standardizedUrl: Text, snippet: Text, borderId: Text, flairId: Text): Text {
        "<svg viewBox=\"0 0 750 500\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"  xmlns:xlink=\"http://www.w3.org/1999/xlink\">" #
        "  <image x=\"0\" y=\"0\" width=\"750\" height=\"500\" xlink:href=\"" # ImageAssets.getBorder(borderId) # "\" />" #
        "  <foreignObject x=\"180\" y=\"130\" width=\"400\" height=\"260\">" #
        "    <p xmlns=\"http://www.w3.org/1999/xhtml\" style=\"white-space: pre-wrap; color: black; font-family: sans-serif; font-size: 20px; word-break: break-word;margin: 0;\">" #
                htmlEncode(snippet) #
        "    </p>" #
        "  </foreignObject>" #
        "  <foreignObject x=\"160\" y=\"345\" width=\"350\" height=\"50\">" #
        "    <div xmlns=\"http://www.w3.org/1999/xhtml\" style=\"display: flex; height: 50px;\">" #
        "     <p style=\"white-space: pre-wrap; color: black; font-family: sans-serif; font-size: 14px; word-break: break-all; margin: 0; align-self: flex-end;\">" #
                htmlEncode(standardizedUrl) #
        "      </p>" #
        "    </div>" #
        "  </foreignObject>" #
        "  <image x=\"515\" y=\"310\" width=\"90\" height=\"90\" xlink:href=\"" # ImageAssets.getFlair(flairId) # "\" />" #
        "</svg>";
    };

    // Encodes certain characters so the string is safe to use in the contents of an HTML element
    // The encoded string is NOT safe for use in other contexts (element attribute, script tag, etc.)
    // https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
    func htmlEncode(unsafeText: Text): Text {
        var text: Text = unsafeText;
        text := Text.replace(text, #char '&', "&amp;");
        text := Text.replace(text, #char '<', "&lt;");
        text := Text.replace(text, #char '>', "&gt;");
        text := Text.replace(text, #char '\'', "&#x27;");
        text := Text.replace(text, #char '\"', "&quot;");
        text;
    };
};