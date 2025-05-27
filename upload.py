import os
import boto3
from concurrent.futures import ThreadPoolExecutor

AWS_ACCESS_KEY_ID = 'AKIAZ5TC5EQPNWADO7KZ'
AWS_SECRET_ACCESS_KEY = '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'
AWS_REGION = "ap-southeast-1"

ss = boto3.Session(
   aws_access_key_id=AWS_ACCESS_KEY_ID,
   aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
   region_name=AWS_REGION,
)

def get_content_type(file_name):
    """Determine the content type based on file extension."""
    if file_name.endswith(".html"):
        return "text/html"
    elif file_name.endswith(".css"):
        return "text/css"
    elif file_name.endswith(".js"):
        return "application/javascript"
    elif file_name.endswith(".woff2"):
        return "font/woff2"
    elif file_name.endswith(".svg"):
        return "image/svg+xml"
    return None

def upload_file(cli, file_path, s3_key, bucket_name):
    """Upload a single file to S3."""
    try:
        content_type = get_content_type(file_path)
        with open(file_path, 'rb') as data:
            print(f"Uploading {file_path} to {s3_key}")
            if content_type:
                cli.put_object(Bucket=bucket_name, Key=s3_key, Body=data, ContentType=content_type)
            else:
                cli.put_object(Bucket=bucket_name, Key=s3_key, Body=data)
        print(f"Uploaded {file_path} to {s3_key}")
    except Exception as e:
        print(f"Error uploading {file_path}: {e}")

def collect_files(base_dir):
    """Recursively collect all file paths in the directory."""
    for root, _, files in os.walk(base_dir):
        for file in files:
            yield os.path.join(root, file)

def upload_dir_to_s3(source_dir, target_path, bucket_name):
    cli = ss.client("s3")
    files = collect_files(source_dir)
    with ThreadPoolExecutor() as executor:
        futures = []
        for file_path in files:
            relative_path = os.path.relpath(file_path, source_dir)
            s3_key = os.path.join(target_path, relative_path).replace("\\", "/")  # Ensure POSIX-style paths
            futures.append(executor.submit(upload_file, cli, file_path, s3_key, bucket_name))

        # Wait for all tasks to complete
        for future in futures:
            future.result()

# Example usage:
upload_dir_to_s3("./dist", "", "usb-fb-prod-in-findo")

client = ss.client("cloudfront")

distribution_id = "E1MJQSY07CQA3I"
# 创建失效请求
response = client.create_invalidation(
    DistributionId=distribution_id,
    InvalidationBatch={
        "Paths": {
            "Quantity": 1,
            "Items": ["/*"],  # 让 CloudFront 清除所有缓存
        },
        "CallerReference": "invalidate-001"  # 确保请求唯一，可用时间戳等
    }
)
print("Invalidation ID:", response["Invalidation"]["Id"])
print("Status:", response["Invalidation"]["Status"])