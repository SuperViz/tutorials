# Live Location App with Superviz Realtime

This app is an example of how to use the superviz realtime package to tracking location.

To start, let's see how to build this app.

## Android configuration

To run this app on Android, you'll need to create a `.env` file on `android/` folder than add to file:

```
MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

## iOS configuration

To run this app on iOS, you'll need to create a `Secret.swift` file
on `ios/Runner/` folder.

### Creating `Secret.swift`

On terminal, move to project folder, and run:

```bash
touch ios/Runner/Secret.swift
```

Open `Secret.swift` file and add the code bellow

```swift
enum Secrets {
  static let mapsApiKey = "YOUR_GOOGLE_MAPS_API_KEY"
}
```

and add this file on your Runner.xcworkspace.

### Adding file on your Runner.xcworkspace:
Open XCode then:

`File > Add File To "Runner"...` then select `Secrets.swift` file.

OR

`Option + Command + A` then select `Secrets.swift` file.

## Setting app environment variables

On project folder create a `.env` file than add to file:

```bash
CLIENT_ID=YOUR_CLIENT_ID
SECRET=YOUR_SECRET
```

## Running

After done all steps just run on terminar:

```bash
flutter run --dart-define-from-file=.env
```

Or on VSCode just press `F5`
