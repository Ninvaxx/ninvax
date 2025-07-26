// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NinvaxApp",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .iOSApplication(
            name: "NinvaxApp",
            targets: ["NinvaxApp"],
            bundleIdentifier: "com.yourdomain.NinvaxApp",
            teamIdentifier: "",
            displayVersion: "1.0",
            bundleVersion: "1",
            infoPlist: .default,
            supportedDeviceFamilies: [ .phone, .pad ],
            supportedInterfaceOrientations: [ .portrait, .landscapeLeft, .landscapeRight ]
        )
    ],
    dependencies: [
    ],
    targets: [
        .executableTarget(
            name: "NinvaxApp",
            path: "Sources"
        )
    ]
)
