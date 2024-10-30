import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_realtime_gps_location_example/src/pages/gps/gps_page.dart';

class HomePage extends StatefulWidget {
  static const String routeName = "/";

  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _usernameInputController = TextEditingController();

  final _formKey = GlobalKey<FormState>();
  final imagesUrl = <String>[
    'https://production.cdn.superviz.com/static/flutter-demos/hera.jpg',
    'https://production.cdn.superviz.com/static/flutter-demos/athena.jpg'
  ];
  late String imageUrl;

  @override
  void initState() {
    super.initState();

    final urlIndex = Random().nextInt(imagesUrl.length);

    imageUrl = imagesUrl[urlIndex];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Superviz Realtime GPS",
          style: TextStyle(
            color: Theme.of(context).colorScheme.onInverseSurface,
          ),
        ),
        elevation: 2.0,
        backgroundColor: Theme.of(context).colorScheme.inverseSurface,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                maxRadius: 50,
                backgroundImage: NetworkImage(
                  imageUrl,
                ),
                child: Center(
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.grey,
                        width: 2.0,
                      ),
                    ),
                    clipBehavior: Clip.hardEdge,
                  ),
                ),
              ),
              const SizedBox(
                height: 12.0,
              ),
              TextFormField(
                controller: _usernameInputController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Username',
                  hintText: 'Guest',
                ),
              ),
              const SizedBox(
                height: 12.0,
              ),
              ElevatedButton(
                onPressed: () {
                  final isValidForm = _formKey.currentState!.validate();

                  if (!isValidForm) return;

                  Navigator.of(context).pushNamed(
                    GpsPage.routeName,
                    arguments: GpsPageArguments(
                      username: _usernameInputController.value.text.trim(),
                      imageUrl: imageUrl,
                    ),
                  );
                },
                child: const Text("Connect to channel"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
