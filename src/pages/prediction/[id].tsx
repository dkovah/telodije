import {
  FloatButton,
  Card,
  Modal,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Tag,
} from "antd";
import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ParsedUrlQuery } from "querystring";
import { FormOutlined } from "@ant-design/icons";
import CryptoJS from "crypto-js";

const { TextArea } = Input;

type Prediction = {
  body: string;
  title: string;
  password: string;
  username: string;
  originDate: Date;
  targetDate: Date;
  targetDateReached: boolean;
};

const PredictionPage = ({ id }: { id: string }) => {
  const { isLoading, data, refetch } = useQuery<Prediction>(["repo"], () =>
    axios.get(`/api/prediction/get/${id}`).then((res) => ({
      ...res.data,
      targetDate: new Date(res.data.targetDate),
      originDate: new Date(res.data.originDate),
    }))
  );

  const [itemValidated, setItemValidated] = useState(false);
  const [keyRequestDialog, setKeyRequestDialog] = useState(
    "Por favor, introduzca la clave de acceso de esta predicción"
  );
  const [createPredictionVisible, setCreatePredictionVisible] = useState(false);

  const [renderData, setRenderData] = useState({
    title: "",
    body: "",
    username: "",
    originDate: "",
  });

  const [form] = Form.useForm<Prediction>();
  const [itemValidationForm] = Form.useForm<{ key: string }>();

  if (isLoading) return "Loading...";

  const itemExists = data?.title !== "¡Bienvenido a TeLoDije!";

  let predictionTitle = data?.targetDateReached
    ? data.title
    : "Vaya, parece que aún no es el momento...";
  let predictionBody = data?.targetDateReached
    ? data.body
    : `...por favor, regresa después de la siguiente fecha: ${data?.targetDate?.toLocaleDateString()}. O también puedes crear una nueva predicción haciendo click en el ícono en la esquina inferior derecha.`;

  const createPrediction = async () => {
    try {
      const data = await form.validateFields();
      const password = data.password ? data.password : "";

      const toStore = {
        ...data,
        body: CryptoJS.AES.encrypt(data.body, password).toString(),
        title: CryptoJS.AES.encrypt(data.title, password).toString(),
        username: CryptoJS.AES.encrypt(data.username, password).toString(),
        originDate: new Date(),
        targetDate: new Date(data.targetDate),
        password: "",
      };

      const predictionId = (await axios.post("/api/prediction/post", toStore))
        .data.id;
      const url = window.location.href.split("/");
      const predictionUrl = `${url[0]}/${url[1]}/${url[2]}/prediction/${predictionId}`;
      setCreatePredictionVisible(false);
      Modal.info({
        title: (
          <>
            ¡Predicción creada correctamente! Cuando llegue la fecha indicada,
            cualquier persona con la clave de acceso podrá leerla en el
            siguiente enlace:
            <br />
            <a href={predictionUrl}>{predictionUrl}</a>
          </>
        ),
      });

      console.log(
        "test",
        CryptoJS.AES.decrypt(toStore.body, "password").toString(
          CryptoJS.enc.Utf8
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const validateItem = async () => {
    try {
      const key = (await itemValidationForm.validateFields()).key;
      if (key) {
        const testPredictionTitle = CryptoJS.AES.decrypt(
          predictionTitle,
          key
        ).toString(CryptoJS.enc.Utf8);
        const testPredictionBody = CryptoJS.AES.decrypt(
          predictionBody,
          key
        ).toString(CryptoJS.enc.Utf8);
        const username = CryptoJS.AES.decrypt(
          data?.username || "",
          key
        ).toString(CryptoJS.enc.Utf8);
        const originDate = new Date(data?.originDate || "").toLocaleString();

        if (testPredictionTitle && testPredictionBody && username) {
          setRenderData({
            title: testPredictionTitle,
            body: testPredictionBody,
            username,
            originDate,
          });
          setItemValidated(true);
        }
      }
    } catch (error) {}
    setKeyRequestDialog("Clave incorrecta, por favor verifique");
  };

  return (
    <>
      <Modal
        open={itemExists && data?.targetDateReached && !itemValidated}
        title={keyRequestDialog}
        onOk={validateItem}
        cancelButtonProps={{ style: { visibility: "hidden" } }}
      >
        <Form form={itemValidationForm}>
          <Form.Item name="key">
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {(!itemExists ||
        !data?.targetDateReached ||
        (itemExists && itemValidated)) && (
        <>
          <br />
          <div className="card-div">
            <Card
              title={renderData.title || predictionTitle}
              className="card"
              bordered={false}
            >
              <p>{renderData.body || predictionBody}</p>
            </Card>
            <br />
            <Tag color="blue">{renderData.username}</Tag>
            <Tag color="green">{renderData.originDate}</Tag>
          </div>
        </>
      )}

      <FloatButton
        type="primary"
        icon={<FormOutlined />}
        onClick={() => setCreatePredictionVisible(true)}
      />

      <Modal
        title="Nueva Predicción"
        open={createPredictionVisible}
        onOk={createPrediction}
        onCancel={() => setCreatePredictionVisible(false)}
      >
        <Form
          form={form}
          name="create-prediction"
          onFinish={() => {}}
          style={{ maxWidth: 600 }}
        >
          <Row style={{ paddingBottom: 0 }}>
            <Col span={24}>
              <Row gutter={16}></Row>
            </Col>

            <Col span={24}>
              <Row gutter={16}>
                <Col span={12}>
                  Nombre del creador:
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Introduce tu nombre",
                      },
                    ]}
                  >
                    <Input placeholder="Tu nombre" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  Clave de acceso:
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Introduce una contraseña",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row gutter={16}>
                <Col span={12}>
                  Título de la predicción:
                  <Form.Item
                    name="title"
                    rules={[
                      {
                        required: true,
                        message: "Introduce un título",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  Fecha en la que estará disponible:
                  <Form.Item
                    name="targetDate"
                    rules={[
                      {
                        required: true,
                        message: "Selecciona una fecha",
                      },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              Cuerpo de la predicción:
              <Form.Item
                name="body"
                rules={[
                  {
                    required: true,
                    message: "Escribe algo en el cuerpo de la predicción",
                  },
                ]}
              >
                <TextArea rows={8} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

PredictionPage.getInitialProps = async ({
  query,
}: {
  query: ParsedUrlQuery;
}) => {
  const { id } = query;
  return { id };
};

export default PredictionPage;
