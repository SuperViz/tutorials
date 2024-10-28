import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../../types/types.dart';
import 'package:superviz_realtime/superviz_realtime.dart';

class HomeController extends ChangeNotifier {
  late Realtime _realtime;

  final List<Message> _messages = [];
  List<Message> get messages => _messages;

  final Set<PresenceEvent> _connectedUsers = {};
  Set<PresenceEvent> get connectedUsers => _connectedUsers;

  Channel? _channel;

  bool _isConnected = false;
  bool get isConnected => _isConnected;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String userId = const Uuid().v4();

  final _userColor = (Random().nextDouble() * 0xFFFFFF).toInt();

  void disconnect() {
    _realtime.destroy();
    _messages.clear();
    connectedUsers.clear();
  }

  Future<void> connectToChannel({
    required String channelToJoin,
    String username = '',
  }) async {
    if (isConnected) return;

    _isLoading = true;
    notifyListeners();

    try {
      _realtime = Realtime(
        const RealtimeAuthenticationParams(
          clientId: String.fromEnvironment('CLIENT_ID'),
          secret: String.fromEnvironment('SECRET'),
        ),
        RealtimeEnvironmentParams(
          participant: Participant(
            id: userId,
            name: username,
          ),
          environment: EnvironmentTypes.dev,
        ),
      );

      _channel = await _realtime.connect(channelToJoin);

      _channel!.subscribe<RealtimeChannelState>(
        RealtimeChannelEvent.realtimeChannelStateChanged.description,
        (RealtimeChannelState state) {
          switch (state) {
            case RealtimeChannelState.connected:
              _channel!.participant.getAll().then((participants) {
                _connectedUsers.addAll(participants);
              });

              _isConnected = true;
              _isLoading = false;
              break;
            case RealtimeChannelState.connecting:
              _isConnected = false;
              _isLoading = true;
              break;
            case RealtimeChannelState.disconnected:
              _isConnected = false;
              _isLoading = false;
              break;
          }

          notifyListeners();
        },
      );

      _subscribeOnDefaultEvents();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
    }
  }

  void sendMessage(String message) async {
    _channel!.publish(
      'channel.new.message',
      {
        'id': const Uuid().v4(),
        'message': message,
        'username': _channel!.user.name,
        'color': _userColor,
        'date': DateTime.now().millisecondsSinceEpoch,
        'userId': _channel!.user.id,
        'readed': false,
        'recived': false,
      },
    );
  }

  void _subscribeOnDefaultEvents() {
    _onReciveMessage();
    _onNewMessageEvent();
    _onNewUser();
    _onLeaveUser();
  }

  void _onNewUser() {
    return _channel!.participant.subscribe(PresenceEvents.joinedRoom,
        (connectedUser) {
      _connectedUsers.add(connectedUser);
    });
  }

  void _onLeaveUser() {
    return _channel!.participant.subscribe(PresenceEvents.leave, (presence) {
      _connectedUsers.remove(presence);
      notifyListeners();
    });
  }

  void _onReciveMessage() {
    return _channel!.subscribe(
      'channel.recived.message',
      (RealtimeMessage data) {
        _messages
            .where((element) => element.id == data.data['messageId'])
            .forEach((element) => element.recived = true);
        notifyListeners();
      },
    );
  }

  void _onNewMessageEvent() {
    _channel!.subscribe('channel.new.message', (RealtimeMessage message) {
      _addNewMessage(message);

      if (message.data['userId'] == _channel!.user.id) return;

      _channel!.publish(
        'channel.recived.message',
        {
          'messageId': message.data['id'],
        },
      );
    });
  }

  _addNewMessage(RealtimeMessage message) {
    final isFromUser = message.data['userId'] == _channel!.user.id;

    _messages.insert(
      0,
      Message(
        color: message.data['color'],
        id: message.data['id'],
        username: message.data['username'],
        text: message.data['message'],
        date: DateTime.fromMillisecondsSinceEpoch(message.data['date']),
        isFromUser: isFromUser,
        readed: message.data['readed'] ?? false,
        recived: message.data['recived'] ?? false,
        sended: true,
      ),
    );
    notifyListeners();
  }
}
