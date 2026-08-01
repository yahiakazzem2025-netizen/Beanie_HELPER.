// index.js
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

// ====== إعدادات عامة ======
const complaintsChannelId = "1532879744985469060"; // ID روم الشكاوي
let points = {}; // تخزين نقاط مؤقت (في الذاكرة)

// خريطة لحفظ وقت فتح التذكرة لكل مستخدم (userId -> timestamp)
const ticketStartTimestamps = new Map();

// دالة تعرض الاسم أو اللقب المناسب
function getDisplayName(user) {
  if (!user) return "Unknown";
  if (user.username === "yigo_gaming2013_yt") {
    return "「 ✦ OWNER ✦ 」";
  }
  return user.username;
}

// بانلز جاهزة
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
...`
};

// ====== حدث استقبال الرسائل (أوامر نصية) ======
client.on('messageCreate', async (message) => {
  try {
    if (message.author?.bot) return;

    const contentRaw = message.content ?? '';
    const content = contentRaw.trim();
    if (!content) return;
    const args = content.split(/\s+/);
    const command = args[0];

    // فتح تذكرة جديدة: يرسل DM مع الأسئلة وزر "إنهاء التذكرة"
    if (command === '!newticket') {
      const dmText = `🎫 **تم فتح تذكرة جديدة**  
━━━━━━━━━━━━━━━━━━  
👤 العضو: ${getDisplayName(message.author)}  

💬 من فضلك جاوب على الأسئلة التالية:  
1️⃣ ما هي مشكلتك أو استفسارك؟  
2️⃣ هل واجهت هذه المشكلة من قبل؟  
3️⃣ هل جربت حلول سابقة؟ وما هي؟  
4️⃣ هل عندك صور أو تفاصيل إضافية تساعدنا؟  

✍️ اكتب إجاباتك هنا في الخاص، ولما تخلص اضغط زر "إنهاء التذكرة" لإرسال الإجابات مباشرةً لروم الشكاوي.  
━━━━━━━━━━━━━━━━━━`;

      const finishButton = new ButtonBuilder()
        .setCustomId('finish_ticket')
        .setLabel('إنهاء التذكرة وإرسال الإجابات')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(finishButton);

      try {
        // إرسال الـ DM
        const dmMessage = await message.author.send({ content: dmText, components: [row] });

        // حفظ طابع زمني لبدء التذكرة (نأخذ وقت إرسال رسالة البوت كمرجع)
        ticketStartTimestamps.set(message.author.id, Date.now());

        await message.reply('✅ تم فتح تذكرتك في الخاص، افتح الخاص وأجب على الأسئلة ثم اضغط الزر لإرسال الإجابات.');
      } catch (err) {
        console.warn('Failed to send DM to user:', err);
        await message.reply("⚠️ لم أستطع إرسال رسالة خاصة لك. تأكد أن الخاص مفتوح أو تواصل مع الإدارة.");
      }

      // إشعار اختياري في الشات العام
      try {
        const complaintsChannel = await client.channels.fetch(complaintsChannelId).catch(() => null);
        if (complaintsChannel && typeof complaintsChannel.send === 'function') {
          await complaintsChannel.send(`📢 **تذكرة جديدة**\n👤 العضو: ${getDisplayName(message.author)}\n🆔 ID: ${message.author.id}\n💬 فتح تذكرة جديدة ويستعد للإجابة في الخاص.`);
        }
      } catch (err) {
        console.error('Error notifying complaints channel on newticket:', err);
      }

      return;
    }

    // أوامر مساعدة بسيطة
    if (command === '!help2') {
      return message.reply('استخدم !newticket لفتح تذكرة في الخاص.');
    }

  } catch (outerErr) {
    console.error('Unhandled error in messageCreate handler:', outerErr);
  }
});

// ====== حدث التعامل مع الضغط على الأزرار (Interaction) ======
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'finish_ticket') {
      // تأكد إن التفاعل في DM
      const channel = interaction.channel;
      if (!channel || channel.type !== ChannelType.DM) {
        return interaction.reply({ content: '⚠️ هذا الزر يعمل فقط داخل الرسائل الخاصة (DM). افتح الخاص واضغط الزر هناك.', ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      try {
        // جلب آخر الرسائل من DM (حد أقصى 100 رسالة)
        const fetched = await channel.messages.fetch({ limit: 100 });

        // احصل على طابع بدء التذكرة للمستخدم، لو مش موجود نعتبر كل الرسائل بعد الآن
        const startTs = ticketStartTimestamps.get(interaction.user.id) || 0;

        // فلترة رسائل العضو فقط، استبعاد رسائل البوت، استبعاد الأوامر (اللي تبدأ بـ "!")
        // وأيضًا استبعاد أي رسالة أقدم من وقت فتح التذكرة (startTs)
        const userMessages = fetched
          .filter(m => {
            if (!m.content) return false;
            if (m.author.id !== interaction.user.id) return false; // رسائل العضو فقط
            if (m.author.bot) return false; // استبعاد أي بوت (أمان)
            if (m.createdTimestamp < startTs) return false; // استبعاد الرسائل القديمة قبل فتح التذكرة
            const txt = m.content.trim();
            if (txt.length === 0) return false;
            if (txt.startsWith('!')) return false; // استبعاد أوامر
            return true;
          })
          .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        // بناء نص الإجابات بترقيم بسيط 1., 2., 3.
        let answersText = '';
        if (userMessages.size === 0) {
          answersText = 'لا توجد إجابات نصية جديدة منذ فتح التذكرة.';
        } else {
          const lines = userMessages.map((m, i) => `${i + 1}. ${m.content.replace(/\r?\n/g, ' ')}`);
          answersText = lines.join('\n');
        }

        // جلب قناة الشكاوي وإرسال الإجابات هناك
        const complaintsChannel = await client.channels.fetch(complaintsChannelId).catch(() => null);

        if (complaintsChannel && typeof complaintsChannel.send === 'function') {
          await complaintsChannel.send({
            content: `📥 **إجابات تذكرة مكتملة**\n━━━━━━━━━━━━━━━━━━\n👤 العضو: ${getDisplayName(interaction.user)}\n🆔 ID: ${interaction.user.id}\n💬 الإجابات المرسلة من الخاص (منذ فتح التذكرة):\n${answersText}\n━━━━━━━━━━━━━━━━━━`
          });

          // بعد الإرسال نقدر نحذف الطابع الزمني لو عايز (عشان ما يتكرر)
          ticketStartTimestamps.delete(interaction.user.id);

          await interaction.editReply({ content: '✅ تم إرسال إجاباتك الجديدة لروم الشكاوي بنجاح. شكراً لتعاونك.' });
        } else {
          await interaction.editReply({ content: '⚠️ لم أتمكن من إيجاد روم الشكاوي لإرسال الإجابات. تواصل مع الإدارة.' });
        }
      } catch (err) {
        console.error('Error while finishing ticket via button:', err);
        await interaction.editReply({ content: '⚠️ حدث خطأ أثناء محاولة إرسال إجاباتك. حاول مرة أخرى أو تواصل مع الإدارة.' });
      }
    }
  } catch (err) {
    console.error('Unhandled error in interaction handler:', err);
  }
});

// ====== تشغيل البوت ======
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
