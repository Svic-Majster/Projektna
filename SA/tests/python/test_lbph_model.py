import cv2
import numpy as np

# preveri ce se LBPH model lahko ustvari
def test_lbph_model_creation():
    model = cv2.face.LBPHFaceRecognizer_create()

    assert model is not None

# preveri ce se model lahko nauci na dummy slikah
def test_lbph_model_training():
    model = cv2.face.LBPHFaceRecognizer_create()

    # dummy grayscale slike
    image1 = np.zeros((100, 100), dtype=np.uint8)
    image2 = np.ones((100, 100), dtype=np.uint8) * 255

    images = [image1, image2]
    labels = np.array([1, 1])

    # treniranje modela
    model.train(images, labels)

    assert model is not None

# preveri ce predict vrne label in confidence
def test_lbph_model_prediction():
    model = cv2.face.LBPHFaceRecognizer_create()

    # dummy grayscale slike
    image1 = np.zeros((100, 100), dtype=np.uint8)
    image2 = np.ones((100, 100), dtype=np.uint8) * 255

    images = [image1, image2]
    labels = np.array([1, 1])

    # naucimo model
    model.train(images, labels)

    # test prediction
    predicted_label, confidence = model.predict(image1)

    assert predicted_label == 1
    assert isinstance(confidence, float)