// QR code for a join link, drawn in the browser (no service involved).
import React, { useEffect, useState } from 'react'
import { Box, Button, HStack, Image, Skeleton } from '@chakra-ui/react'
import QRCode from 'qrcode'

type Props = { url: string; size?: number; downloadName?: string; showDownloads?: boolean }

const QrCode = ({ url, size = 220, downloadName = 'class-qr', showDownloads = false }: Props) => {
  const [png, setPng] = useState<string | null>(null)
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    const opts = { errorCorrectionLevel: 'M' as const, margin: 1, color: { dark: '#1A1530', light: '#FFFFFF' } }
    Promise.all([
      QRCode.toDataURL(url, { ...opts, width: 1024 }),
      QRCode.toString(url, { ...opts, type: 'svg' }),
    ]).then(([p, s]) => {
      if (!live) return
      setPng(p)
      setSvg(s)
    })
    return () => {
      live = false
    }
  }, [url])

  const download = (href: string, ext: string) => {
    const a = document.createElement('a')
    a.href = href
    a.download = `${downloadName}.${ext}`
    a.click()
  }

  return (
    <Box>
      <Box bg="white" p={2} borderRadius="md" w={`${size + 16}px`}>
        {png ? (
          <Image src={png} alt={`QR code for ${url}`} w={`${size}px`} h={`${size}px`} />
        ) : (
          <Skeleton w={`${size}px`} h={`${size}px`} />
        )}
      </Box>
      {showDownloads && png && svg && (
        <HStack mt={2} spacing={2}>
          <Button size="xs" variant="outline" onClick={() => download(png, 'png')}>
            PNG
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() =>
              download(URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), 'svg')
            }
          >
            SVG
          </Button>
        </HStack>
      )}
    </Box>
  )
}

export default QrCode
