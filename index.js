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
const ticketStartTimestamps = new Map(); // userId -> timestamp

function getDisplayName(user) {
  if (!user) return "Unknown";
  if (user.username === "yigo_gaming2013_yt") return "「 ✦ OWNER ✦ 」";
  return user.username;
}

// ====== فتح تذكرة (أمر) ======
client.on('messageCreate', async (message) => {
  try {
    if (message.author?.bot) return;
    const content = (message.content ?? '').trim();
    if (!content) return;

    if (content === '!newticket') {
      const dmText = `🎫 **تم فتح تذكرة جديدة**  
━━━━━━━━━━━━━━━━━━  
👤 العضو: ${getDisplayName(message.author)}  

💬 من فضلك جاوب على الأسئلة التالية:  
1️⃣ ما هي مشكلتك أو استفسارك؟  
2️⃣ هل واجهت هذه المشكلة من قبل؟  
3️⃣ هل جربت حلول سابقة؟ وما هي؟  
4️⃣ هل عندك صور أو تفاصيل إضافية تساعدنا؟  

✍️ اكتب إجاباتك هنا في الخاص، ولما تخلص اضغط زر "إنهاء التذكرة" لإرسال الإجابات الجديدة فقط.  
━━━━━━━━━━━━━━━━━━`;

      const finishButton = new ButtonBuilder()
        .setCustomId('finish_ticket')
        .setLabel('إنهاء التذكرة وإرسال الإجابات')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(finishButton);

      try {
        await message.author.send({ content: dmText, components: [row] });
        // سجل وقت فتح التذكرة الآن
        ticketStartTimestamps.set(message.author.id, Date.now());
        await message.reply('✅ تم فتح تذكرتك في الخاص. افتح الخاص وأجب على الأسئلة ثم اضغط الزر لإرسال الإجابات الجديدة.');
      } catch (err) {
        console.warn('Failed to send DM to user:', err);
        await message.reply('⚠️ لم أتمكن من إرسال رسالة خاصة. تأكد أن الخاص مفتوح أو تواصل مع الإدارة.');
      }

      // أرسل رسالة جديدة في روم الشكاوي تفيد بفتح تذكرة (رسالة جديدة، ليست تعديل)
      try {
        const complaintsChannel = await client.channels.fetch(complaintsChannelId).catch(() => null);
        if (complaintsChannel && typeof complaintsChannel.send === 'function') {
          await complaintsChannel.send({
            content: `📢 **تذكرة جديدة**\n━━━━━━━━━━━━━━━━━━\n👤 العضو: ${getDisplayName(message.author)}\n🆔 ID: ${message.author.id}\n💬 تذكرة جديدة مفتوحة في الخاص، يرجى المتابعة.`
          });
        }
      } catch (err) {
        console.error('Error notifying complaints channel on newticket:', err);
      }
    }

    // اختصار مساعدة
    if (content === '!help2') {
      return message.reply('استخدم !newticket لفتح تذكرة في الخاص.');
    }
  } catch (err) {
    console.error('Unhandled error in messageCreate:', err);
  }
});

// ====== التعامل مع الضغط على الزر ======
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'finish_ticket') return;

    // تأكد إن التفاعل داخل DM
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.DM) {
      return interaction.reply({ content: '⚠️ هذا الزر يعمل فقط داخل الرسائل الخاصة (DM). افتح الخاص واضغط الزر هناك.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // جلب آخر الرسائل من DM (حد أقصى 100 رسالة)
      const fetched = await channel.messages.fetch({ limit: 100 });

      // طابع بدء التذكرة المسجل عند !newticket
      const startTs = ticketStartTimestamps.get(interaction.user.id) || 0;

      // فلترة: رسائل العضو فقط، بعد وقت الفتح، استبعاد أوامر (تبدأ بـ "!") واستبعاد رسائل البوت
      const userMessages = fetched
        .filter(m => {
          if (!m.content) return false;
          if (m.author.id !== interaction.user.id) return false;
          if (m.author.bot) return false;
          if (m.createdTimestamp < startTs) return false; // فقط الجديدة بعد فتح التذكرة
          const txt = m.content.trim();
          if (txt.length === 0) return false;
          if (txt.startsWith('!')) return false;
          return true;
        })
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      // لو مفيش رسائل جديدة، نبلغ المستخدم وما نرسلش فاضي
      if (!userMessages || userMessages.size === 0) {
        await interaction.editReply({ content: '⚠️ لم يتم العثور على أي إجابات جديدة منذ فتح التذكرة. اكتب إجابتك في الخاص ثم اضغط الزر مرة أخرى.' });
        return;
      }

      // بناء نص الإجابات بترقيم بسيط 1., 2., 3.
      const lines = userMessages.map((m, i) => `${i + 1}. ${m.content.replace(/\r?\n/g, ' ')}`);
      const answersText = lines.join('\n');

      // إرسال رسالة جديدة في روم الشكاوي تحتوي على الإجابات (رسالة جديدة)
      const complaintsChannel = await client.channels.fetch(complaintsChannelId).catch(() => null);
      if (complaintsChannel && typeof complaintsChannel.send === 'function') {
        await complaintsChannel.send({
          content: `📥 **إجابات تذكرة مكتملة**\n━━━━━━━━━━━━━━━━━━\n👤 العضو: ${getDisplayName(interaction.user)}\n🆔 ID: ${interaction.user.id}\n💬 الإجابات المرسلة من الخاص (منذ فتح التذكرة):\n${answersText}\n━━━━━━━━━━━━━━━━━━`
        });

        // بعد الإرسال نحذف الطابع الزمني حتى لو فتح تذكرة جديدة لازم يعمل !newticket مرة أخرى
        ticketStartTimestamps.delete(interaction.user.id);

        await interaction.editReply({ content: '✅ تم إرسال إجاباتك الجديدة لروم الشكاوي بنجاح. شكراً لتعاونك.' });
      } else {
        await interaction.editReply({ content: '⚠️ لم أتمكن من إيجاد روم الشكاوي لإرسال الإجابات. تواصل مع الإدارة.' });
      }
    } catch (err) {
      console.error('Error while finishing ticket via button:', err);
      await interaction.editReply({ content: '⚠️ حدث خطأ أثناء محاولة إرسال إجاباتك. حاول مرة أخرى أو تواصل مع الإدارة.' });
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
