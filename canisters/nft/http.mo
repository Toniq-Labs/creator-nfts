// Modified from https://github.com/ORIGYN-SA/motoko_http_handler

import HashMap = "mo:base/HashMap";
import Blob = "mo:base/Blob";
import Text "mo:base/Text";
import Option "mo:base/Option";

module HttpHelper {
    public type HttpRequest = {
        body: Blob;
        headers: [HeaderField];
        method: Text;
        url: Text;
    };

    public type HttpResponse = {
        body: Blob;
        headers: [HeaderField];
        status_code: Nat16;
    };

    public type HeaderField = (Text, Text);

    public func removeQuery(str: Text): Text {
        return Option.unwrap(Text.split(str, #char '?').next());
    };
};