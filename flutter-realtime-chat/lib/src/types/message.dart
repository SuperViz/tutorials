class Message {
  String id;
  String username;
  String text;
  DateTime date;
  int color;
  bool isFromUser;
  bool sended;
  bool recived;
  bool readed;

  Message({
    required this.id,
    required this.username,
    required this.text,
    required this.date,
    required this.isFromUser,
    required this.color,
    this.sended = false,
    this.recived = false,
    this.readed = false,
  });
}
