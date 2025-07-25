import SwiftUI

struct ContentView: View {
    @State private var searchText: String = ""

    private let allStrains: [Strain] = [
        Strain(id: UUID(), name: "Alpha", price: 12.0, store: "Downtown"),
        Strain(id: UUID(), name: "Beta", price: 15.5, store: "Uptown"),
        Strain(id: UUID(), name: "Gamma", price: 20.0, store: "East Side")
    ]

    private let neonPink = Color(red: 1.0, green: 0.0, blue: 0.5)

    init() {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.black
        appearance.titleTextAttributes = [.foregroundColor: UIColor(red: 1.0, green: 0.0, blue: 0.5, alpha: 1.0)]
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
    }

    var filteredStrains: [Strain] {
        if searchText.isEmpty { return allStrains }
        return allStrains.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationView {
            ZStack(alignment: .bottomTrailing) {
                Color.black.ignoresSafeArea()
                VStack {
                    TextField("Search", text: $searchText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .padding()
                    ScrollView {
                        ForEach(filteredStrains) { strain in
                            StrainCard(strain: strain)
                                .padding(.horizontal)
                        }
                    }
                }
                Button(action: { /* map action */ }) {
                    Image(systemName: "map")
                        .padding()
                        .background(neonPink)
                        .foregroundColor(.white)
                        .clipShape(Circle())
                }
                .padding()
            }
            .navigationTitle("Ninvax")
        }
    }
}

#Preview {
    ContentView()
}
