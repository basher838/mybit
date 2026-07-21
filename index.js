const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('clientReady', () => {
  console.log(`✅ ${client.user.tag} is online!`);
});

client.on('guildMemberAdd', member => {
  const channel = member.guild.systemChannel;
  if (!channel) return;

  channel.send(`👋 أهلاً وسهلاً ${member} في سيرفر **${member.guild.name}** ❤️`);
});

client.on('guildMemberRemove', member => {
  const channel = member.guild.systemChannel;
  if (!channel) return;

  channel.send(`😢 وداعاً **${member.user.tag}** نتمنى لك التوفيق.`);
});

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;
  // أمر امسح
  if (message.content.startsWith('امسح')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ ليس لديك صلاحية.');
    }

    const args = message.content.split(' ');
    const amount = parseInt(args[1]);

    if (!amount || amount < 1 || amount > 100) {
      return message.reply('❌ اكتب رقمًا من 1 إلى 100.');
    }

    await message.channel.bulkDelete(amount, true).catch(() => {});
    return message.channel.send(`✅ تم حذف ${amount} رسالة.`)
      .then(msg => setTimeout(() => msg.delete().catch(() => {}), 3000));
  }

  // أمر قل
  if (message.content.startsWith('قل ')) {
    const text = message.content.slice(3).trim();

    if (!text) {
      return message.reply('❌ اكتب رسالة.');
    }

    await message.delete().catch(() => {});
    return message.channel.send(text);
  }

  // أمر بينج
  if (message.content === 'بينج') {
    return message.reply(`🏓 سرعة البوت: ${client.ws.ping}ms`);
  }

  // أمر مساعدة
  if (message.content === 'مساعدة') {
    const embed = new EmbedBuilder()
      .setTitle('📜 أوامر REX BOT')
      .setDescription(`
🧹 **امسح 10**
💬 **قل رسالتك**
🏓 **بينج**
📜 **مساعدة**
      `)
      .setColor('Blue');

    return message.channel.send({ embeds: [embed] });
  }
  // أمر طرد
  if (message.content.startsWith('طرد')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply('❌ ليس لديك صلاحية.');

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ منشن العضو.');

    await member.kick();
    return message.channel.send(`👢 تم طرد ${member.user.tag}`);
  }

  // أمر حظر
  if (message.content.startsWith('حظر')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply('❌ ليس لديك صلاحية.');

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ منشن العضو.');

    await member.ban();
    return message.channel.send(`🔨 تم حظر ${member.user.tag}`);
  }

  // أمر إعطاء رتبة
  if (message.content.startsWith('اعط')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.reply('❌ ليس لديك صلاحية.');

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ منشن العضو.');

    const roleName = message.content.split(' ').slice(2).join(' ');
    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) return message.reply('❌ الرتبة غير موجودة.');

    await member.roles.add(role);
    return message.channel.send(`✅ تم إعطاء رتبة **${role.name}** إلى ${member}.`);
  }

  // أمر إزالة رتبة
  if (message.content.startsWith('اسحب')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.reply('❌ ليس لديك صلاحية.');

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ منشن العضو.');

    const roleName = message.content.split(' ').slice(2).join(' ');
    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) return message.reply('❌ الرتبة غير موجودة.');

    await member.roles.remove(role);
    return message.channel.send(`✅ تم إزالة رتبة **${role.name}** من ${member}.`);
  }

  // قفل الشات
  if (message.content === 'قفل') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return message.reply('❌ ليس لديك صلاحية.');

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    });

    return message.channel.send('🔒 تم قفل الشات.');
  }

  // فتح الشات
  if (message.content === 'فتح') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return message.reply('❌ ليس لديك صلاحية.');

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: true
    });

    return message.channel.send('🔓 تم فتح الشات.');
  }
  // معلومات العضو
  if (message.content === 'عضوي') {
    const embed = new EmbedBuilder()
      .setTitle('👤 معلومات العضو')
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        { name: 'الاسم', value: message.author.tag, inline: true },
        { name: 'المعرف', value: message.author.id, inline: true },
        { name: 'تاريخ الدخول', value: `<t:${Math.floor(message.member.joinedTimestamp / 1000)}:F>` }
      )
      .setColor('Green');

    return message.channel.send({ embeds: [embed] });
  }

  // معلومات السيرفر
  if (message.content === 'سيرفر') {
    const embed = new EmbedBuilder()
      .setTitle('🖥️ معلومات السيرفر')
      .setThumbnail(message.guild.iconURL())
      .addFields(
        { name: 'الاسم', value: message.guild.name, inline: true },
        { name: 'الأعضاء', value: `${message.guild.memberCount}`, inline: true },
        { name: 'الرومات', value: `${message.guild.channels.cache.size}`, inline: true }
      )
      .setColor('Blue');

    return message.channel.send({ embeds: [embed] });
  }

  // أفاتار
  if (message.content.startsWith('افاتار')) {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ أفاتار ${user.username}`)
      .setImage(user.displayAvatarURL({ size: 4096 }))
      .setColor('Purple');

    return message.channel.send({ embeds: [embed] });
  }

  // إعلان
  if (message.content.startsWith('اعلن ')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply('❌ ليس لديك صلاحية.');

    const text = message.content.slice(5);

    const embed = new EmbedBuilder()
      .setTitle('📢 إعلان')
      .setDescription(text)
      .setColor('Gold')
      .setTimestamp();

    await message.delete().catch(() => {});
    return message.channel.send({ embeds: [embed] });
  }

});
client.login(process.env.TOKEN)


