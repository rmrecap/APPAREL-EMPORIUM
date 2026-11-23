import paramiko

def test_sftp():
    host = "partnerupload.google.com"
    port = 19321
    username = "mc-sftp-5915122173"
    password = r"1Y$d<y9.B["

    print(f"Connecting to Google SFTP {host}:{port} as {username}...")
    try:
        transport = paramiko.Transport((host, port))
        transport.connect(username=username, password=password)
        sftp = paramiko.SFTPClient.from_transport(transport)
        print("✅ SUCCESS! Connected to Google Merchant Center SFTP!")
        print("Remote current directory files:", sftp.listdir())
        sftp.close()
        transport.close()
    except Exception as e:
        print("❌ SFTP Connection Error:", e)

test_sftp()
