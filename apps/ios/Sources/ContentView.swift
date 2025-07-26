import SwiftUI

struct ContentView: View {
    @State private var searchText: String = ""
    @State private var strains: [Strain] = [
        Strain(id: UUID(), name: "Alpha", price: 12.0, store: "Downtown"),
        Strain(id: UUID(), name: "Beta", price: 15.5, store: "Uptown"),
        Strain(id: UUID(), name: "Gamma", price: 20.0, store: "East Side")
    ]
    @State private var showAddModal = false
    @State private var page: Int = 0

    private let pageSize = 2

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
        if searchText.isEmpty { return strains }
        return strains.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var pagedStrains: [Strain] {
        let filtered = filteredStrains
        let start = page * pageSize
        let end = min(start + pageSize, filtered.count)
        if start < end { return Array(filtered[start..<end]) }
        return []
    }

    var maxPage: Int {
        let count = filteredStrains.count
        return count == 0 ? 0 : (count - 1) / pageSize
    }

    var body: some View {
        NavigationView {
            ZStack(alignment: .bottomTrailing) {
                Color.black.ignoresSafeArea()
                VStack {
                    SearchBar(text: $searchText)
                    ScrollView {
                        ForEach(pagedStrains) { strain in
                            StrainCard(strain: strain)
                                .padding(.horizontal)
                        }
                    }
                    PaginationControls(page: $page, maxPage: maxPage)
                }
                Button(action: { showAddModal = true }) {
                    Image(systemName: "plus")
                        .padding()
                        .background(neonPink)
                        .foregroundColor(.white)
                        .clipShape(Circle())
                }
                .padding()
            }
            .navigationTitle("Ninvax")
        }
        .sheet(isPresented: $showAddModal) {
            AddStrainModal(isPresented: $showAddModal) { strain in
                strains.append(strain)
            }
        }
    }
}

#Preview {
    ContentView()
}
