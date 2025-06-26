import os
import discord
import feedparser
import asyncio
from dotenv import load_dotenv

# Cargar variables de entorno desde un archivo .env
load_dotenv()

# Token de Discord y configuraciones varias
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
CHANNEL_ID = int(os.getenv('CHANNEL_ID', "0"))
RSS_FEED = os.getenv('RSS_FEED')

# Configurar el cliente de Discord
intents = discord.Intents.default()
client = discord.Client(intents=intents)

async def check_rss():
    """Consulta el feed RSS y publica las novedades en Discord."""
    last_entry_id = None
    await client.wait_until_ready()
    channel = client.get_channel(CHANNEL_ID)

    if channel is None:
        print(f"No se pudo acceder al canal {CHANNEL_ID}. Verifica los permisos o el ID.")
        return

    while not client.is_closed():
        feed = feedparser.parse(RSS_FEED)
        if feed.entries:
            latest = feed.entries[0]
            if latest.id != last_entry_id:
                last_entry_id = latest.id
                await channel.send(f"\U0001F4F0 {latest.title}\n{latest.link}")
        # Espera 5 minutos antes de volver a consultar
        await asyncio.sleep(300)

@client.event
async def on_ready():
    print(f"\u2705 Bot conectado como {client.user}")
    asyncio.create_task(check_rss())

if __name__ == '__main__':
    client.run(DISCORD_TOKEN)
