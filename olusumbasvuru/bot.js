const { Client, GatewayIntentBits, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { token, logChannelId, allowedRoleId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'basvuru') {
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: 'Bu komutu kullanma iznin yok!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Oluşum Başvurusu')
            .setDescription('Sunucumuza hoş geldiniz. Aşağıdaki butona basarak başvuru formunu doldurabilirsiniz.');

        const button = new ButtonBuilder()
            .setCustomId('open_basvuru_form')
            .setLabel('Başvuru Yap')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton() && interaction.customId === 'open_basvuru_form') {
        const modal = new ModalBuilder()
            .setCustomId('basvuru_form')
            .setTitle('Oluşum Başvuru Formu');

        const orgNameInput = new TextInputBuilder()
            .setCustomId('olusum_ismi')
            .setLabel('Oluşum İsmi')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const boss1Input = new TextInputBuilder()
            .setCustomId('boss1_id')
            .setLabel('1. Patron/Boss ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const boss2Input = new TextInputBuilder()
            .setCustomId('boss2_id')
            .setLabel('2. Patron/Boss ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const storyInput = new TextInputBuilder()
            .setCustomId('olusum_hikayesi')
            .setLabel('Oluşum Hikayesi')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const whyEraVInput = new TextInputBuilder()
            .setCustomId('neden_erav')
            .setLabel('Neden EraV?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(orgNameInput),
            new ActionRowBuilder().addComponents(boss1Input),
            new ActionRowBuilder().addComponents(boss2Input),
            new ActionRowBuilder().addComponents(storyInput),
            new ActionRowBuilder().addComponents(whyEraVInput)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'basvuru_form') {
        const orgName = interaction.fields.getTextInputValue('olusum_ismi');
        const boss1Id = interaction.fields.getTextInputValue('boss1_id');
        const boss2Id = interaction.fields.getTextInputValue('boss2_id');
        const story = interaction.fields.getTextInputValue('olusum_hikayesi');
        const whyEraV = interaction.fields.getTextInputValue('neden_erav');
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (!logChannel) {
            return interaction.reply({ content: 'Log kanalı bulunamadı!', ephemeral: true });
        }

        const logEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('📜 Yeni Oluşum Başvurusu')
            .addFields(
                { name: '👤 Başvuran', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                { name: '🏷️ Oluşum İsmi', value: orgName, inline: false },
                { name: '👑 1. Patron/Boss ID', value: boss1Id, inline: true },
                { name: '👑 2. Patron/Boss ID', value: boss2Id, inline: true },
                { name: '📖 Oluşum Hikayesi', value: story, inline: false },
                { name: '❓ Neden EraV?', value: whyEraV, inline: false },
                { name: '📅 Tarih', value: new Date().toLocaleString(), inline: false }
            )
            .setFooter({ text: 'Oluşum Başvuru Log Sistemi' })
            .setTimestamp();

        await logChannel.send({ content: '@everyone', embeds: [logEmbed] });

        interaction.reply({ content: 'Başvurun başarıyla alındı!', ephemeral: true });
    }
});

client.on('ready', async () => {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const data = new SlashCommandBuilder()
        .setName('basvuru')
        .setDescription('Oluşum başvurusu yap');

    await guild.commands.create(data);
});

client.login(token);
