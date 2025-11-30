import { Body,  Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, Tailwind, Column, Row, } from "@react-email/components";
import * as React from "react";

interface OrderItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface NewOrderClientEmailProps {
  nombreCliente: string;
  nombreNegocio: string;
  idPedido: number;
  total: number;
  items: OrderItem[];
}

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const NewOrderClientEmail = ({
  nombreCliente,
  nombreNegocio,
  idPedido,
  total,
  items = [],
}: NewOrderClientEmailProps) => {
  const previewText = `${nombreNegocio} comenzará a preparar tu pedido.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-stone-50 font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded-3xl border border-solid border-stone-200 bg-white p-[20px]">
            
            <Section className="mt-[32px] text-center">
              <div className="text-2xl font-bold text-orange-600">Manos Tonilenses</div>
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center text-[20px] font-normal text-stone-800">
              ¡Gracias por tu compra, <strong>{nombreCliente}</strong>!
            </Heading>

            <Text className="text-[14px] leading-[24px] text-stone-600 text-center">
              Hemos enviado tu pedido a <strong>{nombreNegocio}</strong>. <br/>
              Te notificarán cuando empiece a prepararse.
            </Text>

            <Section className="my-[24px] rounded-2xl bg-stone-50 p-4 border border-stone-100">
                <Text className="m-0 text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                    Pedido #{idPedido}
                </Text>
                <Hr className="my-[12px] border-stone-200" />
                
                {items.map((item, index) => (
                    <Row key={index} className="mb-2">
                        <Column className="w-[30px] text-[14px] font-bold text-orange-600">
                            {item.cantidad}x
                        </Column>
                        <Column className="text-[14px] text-stone-700">
                            {item.nombre}
                        </Column>
                        <Column className="text-right text-[14px] font-medium text-stone-900">
                            ${item.precio}
                        </Column>
                    </Row>
                ))}
                
                <Hr className="my-[12px] border-stone-200" />
                <Row>
                    <Column className="text-[16px] font-bold text-stone-800">Total</Column>
                    <Column className="text-right text-[18px] font-bold text-orange-600">
                        ${total.toFixed(2)}
                    </Column>
                </Row>
            </Section>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-full bg-stone-800 px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${baseUrl}/perfil`}
              >
                Ver estado del pedido
              </Button>
            </Section>

            <Text className="text-[12px] leading-[24px] text-stone-500 text-center">
                Recuerda que el pago se realiza directamente con el negocio al momento de la entrega.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NewOrderClientEmail;