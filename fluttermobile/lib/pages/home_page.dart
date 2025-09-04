import 'package:flutter/material.dart';
import '../session.dart';
import 'schedule_page.dart';
import 'leave_request_page.dart';

class HomePage extends StatefulWidget {
  final Session session;
  const HomePage({super.key, required this.session});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      SchedulePage(session: widget.session),
      LeaveRequestPage(session: widget.session),
    ];
    return Scaffold(
      appBar: AppBar(
        title: Text('ยินดีต้อนรับ ${widget.session.user.name}'),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: Center(
              child: Text(
                'ตำแหน่ง: ${widget.session.user.role}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ),
        ],
      ),
      body: pages[_tab],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.calendar_view_week_outlined),
            label: 'ตารางเวร',
          ),
          NavigationDestination(
            icon: Icon(Icons.beach_access_outlined),
            label: 'ขอลางาน',
          ),
        ],
      ),
    );
  }
}
