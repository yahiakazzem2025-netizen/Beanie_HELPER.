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

// عرف الـ Owner ID (جيب الـ ID بتاعك من Discord Developer Mode)
const OWNER_ID = "حط_الـID_بتاعك_هنا";

// نقاط مؤقتة
let points = {};

// بانلز
const panels = {
  1: "📋 بانل رقم 1 - محتوى مخصص",
  2: "📋 بانل رقم 2 - محتوى مخصص"
};

// منتجات الشوب
const shopItems = {
  1: { name: "سيف أسطوري", price: 50 },
  2: { name: "درع قوي", price: 30 },
  3: { name: "جرعة سحرية", price: 20 }
};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const command = args[0];

  // !help2
  if (command === '!help2') {
    message.reply(`
الإعدادات ⚙️
!idstaff ID → إضافة رتبة Staff
!idhigh ID → إضافة رتبة High Staff
!idticket ID → تحديد كاتيجوري التذاكر
!idrating ID → تحديد روم التقييم

اللوحات ❎
!panel 1 → إرسال أول بانل
!panel 2 → إرسال ثاني بانل

الشكر ✏️
!rename اسم → تغيير اسم الشكر
!delete → حذف الشكر

النقاط ⭐
!points → عرض نقاطك
+point @user 10 → إضافة نقاط
-point @user 10 → خصم نقاط

الشوب 🛒
$top → أفضل الإداريين
!shop → عرض المتجر
!buy 1 → شراء المنتج رقم 1

الرسائل 💌
!dm @user الرسالة → إرسال رسالة خاصة
!dms الرسالة → إرسال الرسالة لكل الأعضاء مع منشن تلقائي
    `);
  }

  // الإعدادات ⚙️
  if (command === '!idstaff') message.reply('✅ تم إضافة رتبة Staff بالـ ID');
  if (command === '!idhigh') message.reply('✅ تم إضافة رتبة High Staff بالـ ID');
  if (command === '!idticket') message.reply('🎫 تم تحديد كاتيجوري التذاكر');
  if (command === '!idrating') message.reply('⭐ تم تحديد روم التقييم');

  // اللوحات ❎
  if (command === '!panel') {
    const id = args[1];
    if (panels[id]) {
      message.reply(panels[id]);
    } else {
      message.reply('⚠️ البانل غير موجود');
    }
  }

  // الشكر ✏️
  if (command === '!rename') {
    const newName = args.slice(1).join(' ');
    message.reply(`✏️ تم تغيير اسم الشكر إلى: ${newName}`);
  }
  if (command === '!delete') message.reply('🗑️ تم حذف الشكر');

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

  // الشوب 🛒
  if (command === '$top') message.reply('🏆 أفضل الإداريين:\n1- اسم\n2- اسم');
  if (command === '!shop') {
    let list = "🛒 المتجر:\n";
    for (const id in shopItems) {
      list += `${id}- ${shopItems[id].name} (${shopItems[id].price} نقطة)\n`;
    }
    message.reply(list);
  }
  if (command === '!buy') {
    const id = args[1];
    const item = shopItems[id];
    if (item) {
      const userPoints = points[message.author.id] || 0;
      if (userPoints >= item.price) {
        points[message.author.id] -= item.price;
        message.reply(`✅ اشتريت ${item.name} مقابل ${item.price} نقطة`);
      } else {
        message.reply('❌ نقاطك غير كافية');
      }
    } else {
      message.reply('⚠️ المنتج غير موجود');
    }
  }

  // الرسائل 💌
  if (command === '!dm') {
    const user = message.mentions.users.first();
    const msg = args.slice(2).join(' ');
    if (user && msg) {
      let senderName = message.author.username;
      if (message.author.id === OWNER_ID) {
        senderName += " 「 ✦ OWNER ✦ 」";
      }
      user.send(`💌 رسالة من ${senderName}: ${msg}`).catch(() => {});
      message.reply('📩 تم إرسال الرسالة في الخاص.');
    }
  }
  if (command === '!dms') {
    const msg = args.slice(1).join(' ');
    if (msg) {
      message.guild.members.cache.forEach(member => {
        if (!member.user.bot) {
          let senderName = message.author.username;
          if (message.author.id === OWNER_ID) {
            senderName += " 「 ✦ OWNER ✦ 」";
          }
          member.send(`📢 رسالة من ${senderName}: ${msg}`).catch(() => {});
        }
      });
      message.reply('📩 تم إرسال الرسالة لكل الأعضاء في الخاص.');
    }
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
