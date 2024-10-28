import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../types/types.dart';

class ChatMessages extends StatelessWidget {
  ChatMessages({
    super.key,
    required this.messages,
  });
  final List<Message> messages;

  final _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(12.0),
      controller: _scrollController,
      reverse: true,
      itemCount: messages.length,
      separatorBuilder: (context, index) {
        return const SizedBox(
          height: 12,
        );
      },
      itemBuilder: (context, index) {
        final message = messages[index];

        return LayoutBuilder(
          builder: (context, constraints) {
            return Container(
              width: constraints.maxWidth,
              alignment: message.isFromUser
                  ? Alignment.centerRight
                  : Alignment.centerLeft,
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: constraints.maxWidth * .7,
                ),
                child: Container(
                  padding: const EdgeInsets.all(6.0),
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor,
                    borderRadius: const BorderRadius.all(
                      Radius.circular(12.0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!message.isFromUser)
                        Text(
                          '~${message.username}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Color(message.color).withOpacity(1.0),
                          ),
                        ),
                      Wrap(
                        direction: Axis.horizontal,
                        alignment: WrapAlignment.end,
                        crossAxisAlignment: WrapCrossAlignment.end,
                        children: [
                          SelectableText(
                            message.text,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onPrimary,
                            ),
                          ),
                          const SizedBox(
                            width: 10.0,
                          ),
                          Text(
                            DateFormat("hh:mm").format(message.date),
                            style: const TextStyle(
                              fontSize: 10.0,
                              color: Colors.white70,
                            ),
                          ),
                          if (message.isFromUser) ...[
                            const SizedBox(
                              width: 2.0,
                            ),
                            Icon(
                              message.recived
                                  ? Icons.done_all_rounded
                                  : message.sended
                                      ? Icons.done
                                      : Icons.watch_later_outlined,
                              color: message.recived && message.readed
                                  ? Colors.blue
                                  : Colors.white70,
                              size: 14.0,
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
