from transformers import GPT2LMHeadModel, GPT2Tokenizer
import sys

def generate_code(description, language="javascript"):
    # Load GPT-2 model and tokenizer
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    model = GPT2LMHeadModel.from_pretrained('gpt2')

    # Prompt cho model
    prompt = "Generate {} code to: {}\n".format(language, description)
    inputs = tokenizer(prompt, return_tensors="pt")
    
    # Sinh mã từ prompt
    outputs = model.generate(
        inputs["input_ids"],
        max_length=100,
        num_return_sequences=1,
        temperature=0.7,
        top_p=0.9,
    )

    # Decode kết quả
    generated_code = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return generated_code

if __name__ == "__main__":
    description = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else "javascript"
    print(generate_code(description, language))
