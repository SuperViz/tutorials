final class UserPosition {
  final String userId;
  final String username;
  final String imageUrl;
  double lat;
  double lon;

  UserPosition({
    required this.userId,
    required this.username,
    required this.imageUrl,
    required this.lat,
    required this.lon,
  });

  @override
  bool operator ==(covariant UserPosition other) {
    if (identical(this, other)) return true;

    return other.userId == userId;
  }

  @override
  int get hashCode {
    return userId.hashCode;
  }
}
