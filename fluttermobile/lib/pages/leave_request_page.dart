import 'package:flutter/material.dart';
import '../api/api_client.dart';
import '../models/schedule.dart';
import '../session.dart';

class LeaveRequestPage extends StatefulWidget {
  final Session session;
  const LeaveRequestPage({super.key, required this.session});

  @override
  State<LeaveRequestPage> createState() => _LeaveRequestPageState();
}

class _LeaveRequestPageState extends State<LeaveRequestPage> {
  final _formKey = GlobalKey<FormState>();
  final _reasonCtrl = TextEditingController();
  final ApiClient _api = ApiClient(baseUrl: defaultApiBaseUrl);
  bool _submitting = false;
  String? _submitError;

  List<AssignmentItem> _assignments = [];
  AssignmentItem? _selected;

  @override
  void initState() {
    super.initState();
    _loadAssignments();
  }

  Future<void> _loadAssignments() async {
    try {
      final data = await _api.getMySchedule(widget.session.token);
      final items = data.map((e) => AssignmentItem.fromJson(e)).toList();
      setState(() {
        _assignments = items;
        // preselect next or first
        _selected = items.firstOrNull;
      });
    } catch (e) {
      setState(() => _submitError = 'โหลดรายการเวรล้มเหลว: $e');
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selected == null) return;
    setState(() {
      _submitting = true;
      _submitError = null;
    });
    try {
      await _api.createLeaveRequest(
        token: widget.session.token,
        shiftAssignmentId: _selected!.assignmentId,
        reason: _reasonCtrl.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('ส่งคำขอลาสำเร็จ')));
      setState(() {
        _reasonCtrl.clear();
      });
    } catch (e) {
      setState(() => _submitError = e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'คำขอลางาน',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<AssignmentItem>(
                  isExpanded: true,
                  value: _selected,
                  items: _assignments
                      .map(
                        (a) => DropdownMenuItem(
                          value: a,
                          child: Text(
                            'เวร ${a.assignmentId} | ${_fmtDate(a.date)} ${a.startTime ?? ''}-${a.endTime ?? ''}',
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setState(() => _selected = v),
                  decoration: const InputDecoration(
                    labelText: 'เลือกเวรที่ต้องการลา',
                  ),
                  validator: (v) => v == null ? 'กรุณาเลือกเวร' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _reasonCtrl,
                  minLines: 2,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'เหตุผลการลา',
                    alignLabelWithHint: true,
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'กรอกเหตุผล' : null,
                ),
                const SizedBox(height: 16),
                if (_submitError != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Text(
                      _submitError!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                FilledButton.icon(
                  onPressed: _submitting ? null : _submit,
                  icon: _submitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send_outlined),
                  label: const Text('ส่งคำขอ'),
                ),
                const SizedBox(height: 6),
                const Text(
                  '* ต้องล็อกอินด้วยตำแหน่งพยาบาลเท่านั้น',
                  style: TextStyle(color: Colors.black54),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _fmtDate(DateTime? d) {
    if (d == null) return '-';
    return '${d.year}-${_two(d.month)}-${_two(d.day)}';
  }

  String _two(int n) => n.toString().padLeft(2, '0');
}

extension _FirstOrNull<E> on List<E> {
  E? get firstOrNull => isEmpty ? null : first;
}
