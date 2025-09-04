import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiClient {
  final String baseUrl;
  ApiClient({required this.baseUrl});

  Future<(String token, Map<String, dynamic> user)> login(
      {required String email, required String password}) async {
    final uri = Uri.parse('$baseUrl/api/auth/login');
    final req = await HttpClient().postUrl(uri);
    req.headers.contentType = ContentType.json;
    req.add(utf8.encode(jsonEncode({
      'email': email,
      'password': password,
    })));

    final res = await req.close();
    final body = await utf8.decoder.bind(res).join();
    if (res.statusCode != 200) {
      throw HttpException('Login failed: ${res.statusCode} ${res.reasonPhrase}\n$body');
    }
    final data = jsonDecode(body) as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = data['user'] as Map<String, dynamic>;
    return (token, user);
  }

  Future<List<Map<String, dynamic>>> getMySchedule(String token) async {
    final uri = Uri.parse('$baseUrl/api/my-schedule');
    final req = await HttpClient().getUrl(uri);
    req.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    final res = await req.close();
    final body = await utf8.decoder.bind(res).join();
    if (res.statusCode != 200) {
      throw HttpException('Fetch schedule failed: ${res.statusCode} ${res.reasonPhrase}\n$body');
    }
    final list = jsonDecode(body) as List<dynamic>;
    return list.cast<Map<String, dynamic>>();
  }

  Future<void> createLeaveRequest({
    required String token,
    required int shiftAssignmentId,
    required String reason,
  }) async {
    final uri = Uri.parse('$baseUrl/api/leave-requests');
    final req = await HttpClient().postUrl(uri);
    req.headers.contentType = ContentType.json;
    req.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    req.add(utf8.encode(jsonEncode({
      'shift_assignment_id': shiftAssignmentId,
      'reason': reason,
      'status': 'pending',
      'approved_by': null,
    })));
    final res = await req.close();
    final body = await utf8.decoder.bind(res).join();
    if (res.statusCode != 201) {
      throw HttpException('Create leave failed: ${res.statusCode} ${res.reasonPhrase}\n$body');
    }
  }
}

// Configure/resolve backend base URL here.
// Priority: --dart-define=API_BASE_URL -> Platform default -> localhost
const String _apiBaseUrlFromEnv = String.fromEnvironment('API_BASE_URL');

String resolveDefaultBaseUrl() {
  if (_apiBaseUrlFromEnv.isNotEmpty) return _apiBaseUrlFromEnv;
  if (kIsWeb) return 'http://localhost:3000';
  try {
    if (Platform.isAndroid) return 'http://10.0.2.2:3000';
    // iOS simulator / desktop
    return 'http://localhost:3000';
  } catch (_) {
    // Fallback for platforms where Platform may not be available
    return 'http://localhost:3000';
  }
}

final String defaultApiBaseUrl = resolveDefaultBaseUrl();
