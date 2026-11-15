import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../lib/app.dart';

void main() {
  testWidgets('opens details, returns, and switches to profile', (
    tester,
  ) async {
    await tester.pumpWidget(const StarterApp());
    await tester.tap(find.text('示例条目'));
    await tester.pumpAndSettle();
    expect(find.text('详情'), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();
    expect(find.text('示例条目'), findsOneWidget);

    await tester.tap(find.text('我的'));
    await tester.pumpAndSettle();
    expect(find.text('演示用户'), findsOneWidget);
  });
}
