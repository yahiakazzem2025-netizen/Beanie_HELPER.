const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// نقاط مؤقتة
let points = {};

// بانلز
const panels = {
  1: `🎫 بانل التذاكر
----------------------------
- لفتح تذكرة جديدة اكتب: !newticket
- التذاكر تستخدم للاستفسارات والدعم الفني
- ممنوع استخدام التذاكر في السبام
----------------------------`,

  2: `📋 قوانين السيرفر
----------------------------
احترام جميع الأعضاء والإدارة واجب.
يمنع السب، الشتم، العنصرية أو أي إساءة.
يمنع نشر أي محتوى مخالف أو غير لائق.
يمنع السبام أو تكرار الرسائل أو المنشن المزعج.
يمنع نشر روابط سيرفرات ديسكورد أو الإعلانات بدون إذن.
يمنع انتحال شخصية أي عضو أو إداري.
يمنع النصب أو الاحتيال، وأي حالة نصب تعرض صاحبها للحظر المباشر.
يجب الالتزام بقوانين كل روم وعدم الكتابة خارج موضوعه.
يمنع بيع أو شراء الحسابات أو أي شيء مخالف لشروط المنصة.
في التبادلات، يُفضل استخدام وسيط معتمد من السيرفر.
أي مشكلة بين عضوين يتم فتح تذكرة وعدم إثارة المشاكل في الشات العام.
يمنع استخدام الألفاظ البذيئة أو إثارة الفتن.
قرارات الإدارة تُحترم، ويمكن الاعتراض عليها عبر التذاكر فقط.
العقوبات تبدأ من تنبيه أو تحذير، وقد تصل إلى التايم أوت أو الطرد أو الحظر حسب المخالفة.
دخولك للسيرفر يعني موافقتك على جميع هذه القوانين.
----------------------------`
};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const command = args[0];

  // !help2
  if (command === '!help2') {
    message.reply(`
⚙️ الاعدادات
!idstaff ID → إضافة رتبة Staff
!idhigh ID → إضافة رتبة High Staff
!idticket ID → تحديد كاتيجوري التذاكر
!idrating ID → تحديد روم التقييم
!zshop → يوضح طريقة فتح شوب Zyro

❎ اللوحات
!panel 1 → بانل التذاكر
!panel 2 → قوانين السيرفر

⭐ النقاط
!points → عرض نقاطك
+point @user 10 → إضافة نقاط
-point @user 10 → خصم نقاط

💌 الرسائل
!dm @user الرسالة → إرسال رسالة خاصة
!dms الرسالة → إرسال الرسالة لكل الأعضاء

🎉 الترحيب
!welcome @user → إرسال رسالة ترحيب لعضو جديد

📊 الإحصائيات
!stats → عرض عدد الأعضاء وعدد الأونلاين

🎲 الألعاب
!roll → رمي نرد وإظهار رقم عشوائي

🕒 الوقت
!time → عرض الوقت والتاريخ الحالي
    `);
  }

  // اللوحات ❎
  if (command === '!panel') {
    const id = args[1];
    if (panels[id]) {
      message.reply(panels[id]);
    } else {
      message.reply('⚠️ البانل غير موجود');
    }
  }

  // النقاط ⭐
  if (command === '!points') {
    const userPoints = points[message.author.id] || 0;
    message.reply(`⭐ نقاطك الحالية: ${userPoints}`);
  }

  if (command === '+point') {
    const user = message.mentions.users.first();
    const amount = parseInt(args[2]);
    if (user && !isNaN(amount)) {
      points[user.id] = (points[user.id] || 0) + amount;
      message.reply(`✅ تمت إضافة ${amount} نقطة لـ ${user.username}`);
    }
  }

  if (command === '-point') {
    const user = message.mentions.users.first();
    const amount = parseInt(args[2]);
    if (user && !isNaN(amount)) {
      points[user.id] = (points[user.id] || 0) - amount;
      message.reply(`❌ تم خصم ${amount} نقطة من ${user.username}`);
    }
  }

  // !zshop → يوضح أنه مربوط ببوت Zyro
  if (command === '!zshop') {
    message.reply("🛒 شوب Zyro بيتفتح لما تكتب الأمر !help2 في البوت المخصص له.");
  }

  // الرسائل 💌
  if (command === '!dm') {
    const user = message.mentions.users.first();
    const msg = args.slice(2).join(' ');
    if (user && msg) {
      user.send(`💌 رسالة من ${message.author.username}: ${msg}`).catch(() => {});
      message.reply('📩 تم إرسال الرسالة في الخاص.');
    }
  }

  if (command === '!dms') {
    const msg = args.slice(1).join(' ');
    if (msg) {
      message.guild.members.cache.forEach(member => {
        if (!member.user.bot) {
          member.send(`📢 رسالة من ${message.author.username}: ${msg}`).catch(() => {});
        }
      });
      message.reply('📩 تم إرسال الرسالة لكل الأعضاء في الخاص.');
    }
  }

  // 🎉 الترحيب
  if (command === '!welcome') {
    const user = message.mentions.users.first();
    if (user) {
      message.channel.send(`🎉 أهلاً وسهلاً ${user.username} في السيرفر! نتمنى لك وقت ممتع.`);
    }
  }

  // 📊 الإحصائيات
  if (command === '!stats') {
    const totalMembers = message.guild.memberCount;
    const onlineMembers = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;
    message.reply(`📊 عدد الأعضاء: ${totalMembers}\n🟢 الأونلاين: ${onlineMembers}`);
  }

  // 🎲 الألعاب
  if (command === '!roll') {
    const number = Math.floor(Math.random() * 6) + 1;
    message.reply(`🎲 طلعتلك ${number}`);
  }

  // 🕒 الوقت
  if (command === '!time') {
    const now = new Date();
    message.reply(`🕒 الوقت الحالي: ${now.toLocaleString('ar-EG')}`);
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
