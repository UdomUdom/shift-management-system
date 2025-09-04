class AssignmentItem {
  final int assignmentId;
  final int? shiftId;
  final DateTime? date; // yyyy-MM-dd
  final String? startTime; // time string from backend
  final String? endTime;

  AssignmentItem({
    required this.assignmentId,
    required this.shiftId,
    required this.date,
    required this.startTime,
    required this.endTime,
  });

  factory AssignmentItem.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    final rawDate = json['date'];
    if (rawDate is String && rawDate.isNotEmpty) {
      // Expecting yyyy-MM-dd from backend
      parsedDate = DateTime.tryParse(rawDate);
    }
    return AssignmentItem(
      assignmentId: (json['assignmentId'] ?? 0) as int,
      shiftId: json['shiftId'] as int?,
      date: parsedDate,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
    );
  }
}
