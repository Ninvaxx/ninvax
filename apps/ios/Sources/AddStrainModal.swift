import SwiftUI

struct AddStrainModal: View {
    @Binding var isPresented: Bool
    var onAdd: (Strain) -> Void

    @State private var name = ""
    @State private var price = ""
    @State private var store = ""

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Details")) {
                    TextField("Name", text: $name)
                    TextField("Price", text: $price)
                        .keyboardType(.decimalPad)
                    TextField("Store", text: $store)
                }
            }
            .navigationTitle("Add Strain")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isPresented = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        if let value = Double(price) {
                            let strain = Strain(id: UUID(), name: name, price: value, store: store)
                            onAdd(strain)
                            isPresented = false
                        }
                    }
                }
            }
        }
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State var showing = true
        var body: some View {
            AddStrainModal(isPresented: $showing) { _ in }
        }
    }
    return PreviewWrapper()
}
