function decodedCursor(str) {
    try {
        const test = JSON.parse(Buffer.from(str, "base64url").toString());
        return test
    } catch {
        return null;
    }
}

console.log(decodedCursor('eyJpZCI6MjB9'))