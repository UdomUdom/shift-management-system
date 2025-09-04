import 'package:flutter/material.dart';
import '../api/api_client.dart';
import '../models/schedule.dart';
import '../session.dart';

class SchedulePage extends StatefulWidget {
  final Session session;
  const SchedulePage({super.key, required this.session});

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage> {
  final ApiClient _api = ApiClient(baseUrl: defaultApiBaseUrl);
  late Future<List<AssignmentItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<AssignmentItem>> _load() async {
    final data = await _api.getMySchedule(widget.session.token);
    return data.map((e) => AssignmentItem.fromJson(e)).toList();
  }

  (DateTime start, DateTime end) _currentWeekRange() {
    final now = DateTime.now();
    final start = now.subtract(Duration(days: now.weekday - 1)); // Monday
    final end = start.add(const Duration(days: 6)); // Sunday
    return (
      DateTime(start.year, start.month, start.day),
      DateTime(end.year, end.month, end.day),
    );
  }

  @override
  Widget build(BuildContext context) {
    final (weekStart, weekEnd) = _currentWeekRange();
    return FutureBuilder<List<AssignmentItem>>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snap.hasError) {
          return Center(child: Text('โหลดตารางเวรล้มเหลว: ${snap.error}'));
        }
        final items = (snap.data ?? []).where((a) => a.date != null).where((a) {
          final d = a.date!;
          final day = DateTime(d.year, d.month, d.day);
          return day.isAtSameMomentAs(weekStart) ||
              (day.isAfter(weekStart) && day.isBefore(weekEnd)) ||
              day.isAtSameMomentAs(weekEnd);
        }).toList()..sort((a, b) => a.date!.compareTo(b.date!));

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              color: Theme.of(context).colorScheme.surfaceContainer,
              padding: const EdgeInsets.all(12),
              child: Text(
                'สัปดาห์นี้: ${_fmtDate(weekStart)} - ${_fmtDate(weekEnd)}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            Expanded(
              child: items.isEmpty
                  ? const Center(child: Text('ไม่มีเวรในสัปดาห์นี้'))
                  : ListView.separated(
                      itemCount: items.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, i) {
                        final a = items[i];
                        return ListTile(
                          leading: const Icon(Icons.event_available_outlined),
                          title: Text(_fmtDate(a.date!)),
                          subtitle: Text(
                            'เวลาเริ่ม: ${a.startTime ?? '-'} \n เวลาเลิก: ${a.endTime ?? '-'}',
                          ),
                          trailing: Text('#${a.assignmentId}'),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  String _fmtDate(DateTime d) => '${d.year}-${_two(d.month)}-${_two(d.day)}';
  String _two(int n) => n.toString().padLeft(2, '0');
}
