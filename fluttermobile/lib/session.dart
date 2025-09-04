import 'models/user.dart';

class Session {
  final String token;
  final UserModel user;
  const Session({required this.token, required this.user});
}
