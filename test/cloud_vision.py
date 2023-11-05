# from google.cloud import vision
# from google.cloud.vision import vision
# import os

# def analyze_images(folder_path):
#     client = vision.ImageAnnotatorClient()
#     image_info = []

#     for img_file in os.listdir(folder_path):
#         if img_file.endswith('.png'):
#             img_path = os.path.join(folder_path, img_file)
#             with open(img_path, 'rb') as image_file:
#                 content = image_file.read()
#             image = types.Image(content=content)
#             response = client.label_detection(image=image)
#             labels = response.label_annotations
#             descriptions = [label.description for label in labels]
#             image_info.append((img_path, descriptions))

#     return image_info
