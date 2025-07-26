import SwiftUI

struct PaginationControls: View {
    @Binding var page: Int
    let maxPage: Int

    var body: some View {
        HStack {
            Button("Previous") {
                if page > 0 { page -= 1 }
            }
            .disabled(page == 0)

            Spacer()

            Button("Next") {
                if page < maxPage { page += 1 }
            }
            .disabled(page >= maxPage)
        }
        .padding()
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State var page = 0
        var body: some View {
            PaginationControls(page: $page, maxPage: 2)
        }
    }
    return PreviewWrapper()
}
