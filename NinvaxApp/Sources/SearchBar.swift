import SwiftUI

struct SearchBar: View {
    @Binding var text: String

    var body: some View {
        TextField("Search", text: $text)
            .textFieldStyle(RoundedBorderTextFieldStyle())
            .padding(.horizontal)
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State var text = ""
        var body: some View {
            SearchBar(text: $text)
        }
    }
    return PreviewWrapper()
}
