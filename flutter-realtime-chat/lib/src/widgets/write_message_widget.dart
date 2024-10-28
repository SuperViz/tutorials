import 'package:flutter/material.dart';

class WriteMessage extends StatelessWidget {
  WriteMessage({
    super.key,
    required this.onSendMessage,
  });
  final void Function(String message) onSendMessage;

  final TextEditingController _textFormController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        vertical: 4.0,
        horizontal: 12.0,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextFormField(
              controller: _textFormController,
              onEditingComplete: _sendMessage,
              decoration: const InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(
                    Radius.circular(12.0),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(
            width: 12.0,
          ),
          IconButton(
            onPressed: _sendMessage,
            icon: const Icon(Icons.send),
          ),
        ],
      ),
    );
  }

  void _sendMessage() {
    final message = _textFormController.value.text.trim();

    if (message.isEmpty) return;

    onSendMessage(message);
  }
}
