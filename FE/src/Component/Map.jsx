import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ButtonGroup,
  Spinner
} from 'react-bootstrap'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useRef, useState } from 'react'

const center = { lat: 21, lng: 105.819454 }

function Map() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef()

  if (!isLoaded) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  async function calculateRoute() {
    if (originRef.current.value === '' || destiantionRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destiantionRef.current.value = ''
  }

  return (
    <div className="position-relative vh-100 vw-100">
      {/* Google Map Container */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ zIndex: 1 }}
      >
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </div>

      {/* Control Panel */}
      <div 
        className="position-absolute top-0 start-50 translate-middle-x mt-4"
        style={{ zIndex: 2, minWidth: '600px' }}
      >
        <Card className="shadow">
          <Card.Body>
            <Row className="g-2 mb-3">
              <Col md={4}>
                <Autocomplete>
                  <Form.Control
                    type="text"
                    placeholder="Origin"
                    ref={originRef}
                  />
                </Autocomplete>
              </Col>
              <Col md={4}>
                <Autocomplete>
                  <Form.Control
                    type="text"
                    placeholder="Destination"
                    ref={destiantionRef}
                  />
                </Autocomplete>
              </Col>
              <Col md={4}>
                <ButtonGroup className="w-100">
                  <Button 
                    variant="primary" 
                    onClick={calculateRoute}
                    className="flex-grow-1"
                  >
                    Calculate Route
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearRoute}
                  >
                    <FaTimes />
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>

            <Row className="align-items-center">
              <Col md={4}>
                <span className="fw-bold">Distance: </span>
                <span>{distance}</span>
              </Col>
              <Col md={4}>
                <span className="fw-bold">Duration: </span>
                <span>{duration}</span>
              </Col>
              <Col md={4} className="text-end">
                <Button
                  variant="outline-primary"
                  className="rounded-circle"
                  onClick={() => {
                    map.panTo(center)
                    map.setZoom(15)
                  }}
                >
                  <FaLocationArrow />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Map