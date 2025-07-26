import SwiftUI

struct StrainCard: View {
    var strain: Strain
    private let neonPink = Color(red: 1.0, green: 0.0, blue: 0.5)

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(strain.name)
                .font(.headline)
                .foregroundColor(.white)
            Text(String(format: "$%.2f", strain.price))
                .foregroundColor(.white)
            Text(strain.store)
                .foregroundColor(.white)
            Button("Order") {
                // order action
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(neonPink)
            .foregroundColor(.white)
            .cornerRadius(8)
        }
        .padding()
        .background(Color.black)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.purple, lineWidth: 2))
        .cornerRadius(10)
    }
}

#Preview {
    StrainCard(strain: Strain(id: UUID(), name: "Sample", price: 20.0, store: "Test Store"))
        .padding()
        .background(Color.black)
}
