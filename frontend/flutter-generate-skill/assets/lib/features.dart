import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(16),
    children: [
      Card(
        child: ListTile(
          title: const Text('示例条目'),
          subtitle: const Text('查看详情与返回流程'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.of(context).push<void>(
            MaterialPageRoute<void>(builder: (_) => const DetailPage()),
          ),
        ),
      ),
    ],
  );
}

class DetailPage extends StatelessWidget {
  const DetailPage({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('详情')),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: const [Text('这是本地演示数据，可替换为真实业务内容。')],
      ),
    ),
  );
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(16),
    children: const [
      Card(
        child: ListTile(
          leading: Icon(Icons.person_outline),
          title: Text('演示用户'),
          subtitle: Text('个人资料与账号入口可按业务接入'),
        ),
      ),
    ],
  );
}
