import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'pages/home/home_controller.dart';
import 'pages/home/home_page.dart';

class RealtimeChat extends StatelessWidget {
  const RealtimeChat({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Realtime Chat Demo',
      theme: ThemeData(
        textSelectionTheme: const TextSelectionThemeData(
          selectionColor: Colors.white30,
          selectionHandleColor: Colors.black,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6210CC),
        ),
        useMaterial3: true,
      ),
      home: ChangeNotifierProvider<HomeController>(
        create: (_) {
          return HomeController();
        },
        child: const HomePage(
          title: 'Superviz Realtime Chat Demo',
        ),
      ),
    );
  }
}
