```js
// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL', 'MESSAGE', 'USER']
});

// ====== إعدادات عامة ======
const complaintsChannelId = "1532879744985469060"; // ID روم الشكاوي (المطلوب)
let points = {}; // تخزين نقاط مؤقت (في الذاكرة)

// دالة تعرض الاسم أو اللقب المناسب
function getDisplayName(user) {
  if (!user) return "Unknown";
  if (user.username === "yigo_gaming2013_yt") {
    return "「 ✦ OWNER ✦ 」";
  }
  return user.username;
}

// بانلز / لوحات جاهزة
const panels = {
  1: `🎫 دليل التذاكر
------------------------------
• افتح تذكرة جديدة اكتب: !newticket
• التذاكر تستخدم للاستفسارات والدعم الفني
• ممنوع استخدام التذاكر في السبام
------------------------------`,
  2: `📋 قوانين السيرفر
------------------------------
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
------------------------------`
};

// ====== حدث استقبال الرسائل ======
client.on('messageCreate', async (message) => {
  if (message.author?.bot) return;

  const content = message.content?.trim();
  if (!content) return;
  const args = content.split(/\s+/);
  const command = args[0];

  // ====== !help2 ======
  if (command === '!help2') {
    return message.reply(`
⚙️ الاعدادات
!idstaff ID → إضافة رتبة Staff
!idhigh ID → إضافة رتبة High Staff
!idticket ID → تحديد كاتيجوري التذاكر
!idrating ID → تحديد روم التقييم

❎ اللوحات
!panel 1 → بانل التذاكر
!panel 2 → قوانين السيرفر

⭐ النقاط
!points → عرض نقاطك
+point @user 10 → إضافة نقاط
-point @user 10 → خصم نقاط

🛒 الشوب
!zshop → فتح شوب Zyro (من بوت تاني)

💌 الرسائل
!dm @user الرسالة → إرسال رسالة خاصة (منسقة)
!dms الرسالة → إرسال الرسالة لكل الأعضاء (منسقة)

🎉 الترحيب
!welcome @user → إرسال رسالة ترحيب لعضو جديد

📊 الإحصائيات
!stats → عرض عدد الأعضاء وعدد الأونلاين

🎲 الألعاب
!roll → رمي نرد وإظهار رقم عشوائي

🕒 الوقت
!time → عرض الوقت والتاريخ الحالي

🎫 التذاكر
!newticket → فتح تذكرة جديدة مع أسئلة في الخاص
    `);
  }

  // ====== !panel ======
  if (command === '!panel') {
    const id = args[1];
    if (panels[id]) {
      return message.reply(panels[id]);
    } else {
      return message.reply('⚠️ البانل غير موجود');
    }
  }

  // ====== نقاط النظام ======
  if (command === '!points') {
    const userPoints = points[message.author.id] || 0;
    return message.reply(`⭐ نقاطك الحالية: ${userPoints}`);
  }

  if (command === '+point') {
    const user = message.mentions.users.first();
    const amount = parseInt(args[2]);
    if (user && !isNaN(amount)) {
      points[user.id] = (points[user.id] || 0) + amount;
      return message.reply(`✅ تمت إضافة ${amount} نقطة لـ ${getDisplayName(user)}`);
    } else {
      return message.reply('⚠️ استخدم: +point @user عدد');
    }
  }

  if (command === '-point') {
    const user = message.mentions.users.first();
    const amount = parseInt(args[2]);
    if (user && !isNaN(amount)) {
      points[user.id] = (points[user.id] || 0) - amount;
      return message.reply(`❌ تم خصم ${amount} نقطة من ${getDisplayName(user)}`);
    } else {
      return message.reply('⚠️ استخدم: -point @user عدد');
    }
  }

  // ====== !zshop ======
  if (command === '!zshop') {
    return message.reply("🛒 شوب Zyro بيتفتح لما تكتب الأمر !help2 في البوت المخصص له.");
  }

  // ====== DM منسق - !dm ======
  if (command === '!dm') {
    const user = message.mentions.users.first();
    const msg = args.slice(2).join(' ');
    if (user && msg) {
      try {
        await user.send(`💌 **رسالة خاصة**  
━━━━━━━━━━━━━━━━━━  
👤 من: ${getDisplayName(message.author)}  
💬 المحتوى:  
${msg}  
━━━━━━━━━━━━━━━━━━`);
        return message.reply('✅ تم إرسال الرسالة في الخاص.');
      } catch (err) {
        return message.reply('⚠️ لم أستطع إرسال رسالة خاصة، تأكد أن الخاص مفتوح أو أن البوت لديه صلاحية إرسال رسائل.');
      }
    } else {
      return message.reply('⚠️ استخدم: !dm @user الرسالة');
    }
  }

  // ====== DM عام - !dms ======
  if (command === '!dms') {
    const msg = args.slice(1).join(' ');
    if (!msg) return message.reply('⚠️ اكتب الرسالة بعد الأمر.');
    if (!message.guild) return message.reply('⚠️ هذا الأمر يعمل داخل السيرفر فقط.');
    let sentCount = 0;
    message.guild.members.fetch().then(members => {
      members.forEach(member => {
        if (!member.user.bot) {
          member.send(`📢 **إشعار عام**  
━━━━━━━━━━━━━━━━━━  
👤 من: ${getDisplayName(message.author)}  
💬 المحتوى:  
${msg}  
━━━━━━━━━━━━━━━━━━`).catch(() => {});
          sentCount++;
        }
      });
      message.reply(`✅ تم محاولة إرسال الرسالة إلى ${sentCount} عضو (بعض الرسائل قد تفشل إذا كان الخاص مغلق).`);
    }).catch(() => {
      message.reply('⚠️ حدث خطأ أثناء جلب أعضاء السيرفر.');
    });
    return;
  }

  // ====== ترحيب - !welcome ======
  if (command === '!welcome') {
    const user = message.mentions.users.first();
    if (user) {
      return message.channel.send(`🎉 أهلاً وسهلاً ${getDisplayName(user)} في السيرفر! نتمنى لك وقت ممتع.`);
    } else {
      return message.reply('⚠️ استخدم: !welcome @user');
    }
  }

  // ====== إحصائيات - !stats ======
  if (command === '!stats') {
    if (!message.guild) return message.reply('⚠️ هذا الأمر يعمل داخل السيرفر فقط.');
    const totalMembers = message.guild.memberCount;
    const onlineMembers = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;
    return message.reply(`📊 عدد الأعضاء: ${totalMembers}\n🟢 الأونلاين: ${onlineMembers}`);
  }

  // ====== لعبة النرد - !roll ======
  if (command === '!roll') {
    const number = Math.floor(Math.random() * 6) + 1;
    return message.reply(`🎲 طلعتلك ${number}`);
  }

  // ====== الوقت - !time ======
  if (command === '!time') {
    const now = new Date();
    return message.reply(`🕒 الوقت الحالي: ${now.toLocaleString('ar-EG')}`);
  }

  // ====== فتح تذكرة جديدة مع أسئلة - !newticket ======
  if (command === '!newticket') {
    // إرسال DM للعضو مع الأسئلة
    const dmText = `🎫 **تم فتح تذكرة جديدة**  
━━━━━━━━━━━━━━━━━━  
👤 العضو: ${getDisplayName(message.author)}  

💬 من فضلك جاوب على الأسئلة التالية:  
1️⃣ ما هي مشكلتك أو استفسارك؟  
2️⃣ هل واجهت هذه المشكلة من قبل؟  
3️⃣ هل جربت حلول سابقة؟ وما هي؟  
4️⃣ هل عندك صور أو تفاصيل إضافية تساعدنا؟  

✍️ اكتب إجاباتك هنا في الخاص، وسيتم مراجعتها من فريق الدعم.  
━━━━━━━━━━━━━━━━━━`;

    try {
      await message.author.send(dmText);
      // تأكيد في الشات العام إن التذكرة فتحت
      await message.reply('✅ تم فتح تذكرتك في الخاص، من فضلك جاوب على الأسئلة هناك.');
    } catch (err) {
      return message.reply("⚠️ لم أستطع إرسال رسالة خاصة لك، تأكد أن الخاص مفتوح.");
    }

    // إرسال إشعار لروم الشكاوي (باستخدام الـ ID المحدد مباشرة)
    try {
      // جلب القناة مباشرة عبر client.channels.fetch لضمان الوصول للقناة بغض النظر عن الكاش
      const complaintsChannel = await client.channels.fetch(complaintsChannelId).catch(() => null);

      if (complaintsChannel && (typeof complaintsChannel.send === 'function')) {
        await complaintsChannel.send(`📢 **تذكرة جديدة**  
━━━━━━━━━━━━━━━━━━  
👤 العضو: ${getDisplayName(message.author)}  
🆔 ID: ${message.author.id}  
💬 فتح تذكرة جديدة ويستعد للإجابة على الأسئلة في الخاص.  
━━━━━━━━━━━━━━━━━━`);
      } else {
        await message.channel.send('⚠️ لم أتمكن من إرسال إشعار لروم الشكاوي، تأكد من صحة الـ ID وصلاحيات البوت.');
      }
    } catch (err) {
      await message.channel.send('⚠️ حدث خطأ أثناء محاولة إرسال إشعار التذكرة.');
    }

    return;
  }

  // ====== عندما يكتب المستخدم "خلصت" في الخاص (DM) ======
  // الفكرة: لو العضو رد "خلصت" في الخاص، نجمع آخر الرسائل اللي كتبها العضو في نفس الـ DM (إجابات الاستمارة)
  // ونبعتها لروم الشكاوي بالـ ID المحدد، مع تأكيد للعضو.
  if (content === 'خلصت') {
    // تأكد إن الرسالة في الخاص (DM)
    if (message.guild) {
      return message.reply('⚠️ استخدم هذا الأمر في الخاص بعد ما ترد على الأسئلة في الرسائل الخاصة.');
    }

    try {
      // جلب آخر الرسائل من قناة الـ DM (الرسائل في DM channel)
      const fetched = await message.channel.messages.fetch({ limit: 50 });
      // فلترة رسائل العضو (اللي هي إجابات الاستمارة) واستبعاد أوامر "خلصت"
      const userMessages = fetched
        .filter(m => m.author.id === message.author.id && m.content && m.content.trim() !== 'خلصت')
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp); // ترتيب من الأقدم للأحدث

      let answersText = '';
      if (userMessages.size === 0) {
        answersText = 'لا توجد إجابات نصية في الخاص.';
      } else {
        // نجمع الرسائل مع ترقيم بسيط
        answersText = userMessages.map((m, i) => `${i + 1}. ${m.content}`).join('\n');
      }

      // جلب قناة الشكاوي وإرسال الإجابات هناك باستخدام الـ ID المباشر
      const complaintsChannel = await client.channels.fetch(complaintsChannelId).catch(() => null);

      if (complaintsChannel && (typeof complaintsChannel.send === 'function')) {
        await complaintsChannel.send(`📥 **إجابات تذكرة مكتملة**  
━━━━━━━━━━━━━━━━━━  
👤 العضو: ${getDisplayName(message.author)}  
🆔 ID: ${message.author.id}  
💬 الإجابات المرسلة من الخاص:  
${answersText}  
━━━━━━━━━━━━━━━━━━`);
        // تأكيد للعضو في الخاص
        await message.channel.send('✅ تم إرسال إجاباتك لروم الشكاوي. شكراً لتعاونك.');
      } else {
        await message.channel.send('⚠️ لم أتمكن من إيجاد روم الشكاوي لإرسال الإجابات. تواصل مع الإدارة.');
      }
    } catch (err) {
      console.error('Error forwarding DM answers:', err);
      await message.channel.send('⚠️ حدث خطأ أثناء محاولة إرسال إجاباتك. حاول مرة أخرى أو تواصل مع الإدارة.');
    }

    return;
  }

});

// ====== تشغيل البوت ======
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
```
