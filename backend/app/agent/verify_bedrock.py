import boto3
from .config import get_settings
from .builder import build_agent


def verify():
    print("Testing Boto3 Bedrock Integration...")
    try:
        settings = get_settings()
        print(f"Region: {settings.aws_region}")
        print(f"Model ID: {settings.bedrock_model_id}")

        print("Initializing boto3 client...")
        bedrock_client = boto3.client(
            service_name="bedrock-runtime",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        print("Success: Boto3 client initialized.")

        print("Building agent...")
        agent = build_agent(settings)
        print("Success: Agent built successfully.")

        # We won't actually call the LLM here unless explicitly requested,
        # as it requires valid credentials and costs money.
        print("\nIntegration check passed (client initialization and agent building).")

    except Exception as e:
        print(f"\nVerification failed: {str(e)}")


if __name__ == "__main__":
    verify()
