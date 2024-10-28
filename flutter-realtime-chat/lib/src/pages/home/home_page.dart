import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../widgets/widgets.dart';
import 'home_controller.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.title});

  final String title;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  HomeController? _controller;

  final _channelNameInputController = TextEditingController();
  final _usernameInputController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    _controller ??= context.watch<HomeController>();

    return Scaffold(
      appBar: AppBar(
        actions: [
          if (_controller?.isConnected == true) ...[
            IconButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) {
                    return SimpleDialog(
                      title: const Text('Users'),
                      children: _controller!.connectedUsers.map<Widget>((user) {
                        return ListTile(
                          dense: true,
                          title: Text(user.id),
                          subtitle: Text(user.name),
                        );
                      }).toList(),
                    );
                  },
                );
              },
              icon: const Icon(
                Icons.people_rounded,
                color: Colors.white,
              ),
            ),
            IconButton(
              onPressed: _controller!.disconnect,
              icon: const Icon(
                Icons.logout,
                color: Colors.white,
              ),
            ),
          ],
        ],
        backgroundColor: Theme.of(context).colorScheme.inverseSurface,
        title: Text(
          _controller!.isConnected
              ? _channelNameInputController.value.text
              : widget.title,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onInverseSurface,
          ),
        ),
      ),
      body: SafeArea(
        child: !_controller!.isConnected
            ? _controller!.isLoading
                ? const Center(child: CircularProgressIndicator())
                : Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextFormField(
                            controller: _usernameInputController,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Username',
                              hintText: 'Guest',
                            ),
                          ),
                          const SizedBox(
                            height: 16.0,
                          ),
                          TextFormField(
                            controller: _channelNameInputController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Required field';
                              }

                              return null;
                            },
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Channel to join',
                              hintText: 'my_chat',
                            ),
                          ),
                          const SizedBox(
                            height: 12.0,
                          ),
                          ElevatedButton(
                            onPressed: () {
                              final isValidForm =
                                  _formKey.currentState!.validate();

                              if (!isValidForm) return;

                              final channelName = _channelNameInputController
                                  .value.text
                                  .replaceAll(' ', '-');

                              _controller!.connectToChannel(
                                username: _usernameInputController.value.text,
                                channelToJoin:
                                    'flutter-example-realtime-chat-$channelName',
                              );
                            },
                            child: const Text("Connect to channel"),
                          ),
                        ],
                      ),
                    ),
                  )
            : Column(
                children: [
                  Expanded(
                    child: ChatMessages(
                      messages: _controller!.messages,
                    ),
                  ),
                  WriteMessage(
                    onSendMessage: _controller!.sendMessage,
                  ),
                ],
              ),
      ),
    );
  }
}
