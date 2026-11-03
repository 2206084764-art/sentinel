import Foundation
import AVFoundation
import ImageIO
import CoreVideo

guard CommandLine.arguments.count == 4 else {
    fatalError("Usage: swift scripts/encode-product-loops.swift <frames folder> <output.mp4> <hero|globe>")
}
let folder = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let hero = CommandLine.arguments[3] == "hero"
let width = hero ? 960 : 720, height = hero ? 800 : 720
let fps: Int32 = 60, count = 1080
let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width, AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: hero ? 2400000 : 4200000,
        AVVideoExpectedSourceFrameRateKey: fps,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoAllowFrameReorderingKey: !hero,
        AVVideoMaxKeyFrameIntervalKey: 120
    ]
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: width, kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
])
writer.add(input)
guard writer.startWriting() else {fatalError("Cannot start writer")}
writer.startSession(atSourceTime: .zero)
for index in 0..<count {
    while !input.isReadyForMoreMediaData {Thread.sleep(forTimeInterval: 0.002)}
    try autoreleasepool {
        let file = folder.appendingPathComponent(String(format: "%04d.png", index))
        guard let source = CGImageSourceCreateWithURL(file as CFURL, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, nil),
              let pool = adaptor.pixelBufferPool else {fatalError("Missing frame \(index)")}
        var optional: CVPixelBuffer?
        guard CVPixelBufferPoolCreatePixelBuffer(nil, pool, &optional) == kCVReturnSuccess,
              let buffer = optional else {fatalError("Pixel buffer allocation failed")}
        CVPixelBufferLockBaseAddress(buffer, [])
        defer {CVPixelBufferUnlockBaseAddress(buffer, [])}
        guard let context = CGContext(data: CVPixelBufferGetBaseAddress(buffer), width: width, height: height,
                                      bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
                                      space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue) else {fatalError("Context failed")}
        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        guard adaptor.append(buffer, withPresentationTime: CMTime(value: Int64(index), timescale: fps)) else {
            throw writer.error ?? NSError(domain:"ProductLoop", code:1)
        }
    }
}
input.markAsFinished()
let finished = DispatchSemaphore(value: 0)
writer.finishWriting {finished.signal()}
finished.wait()
guard writer.status == .completed else {fatalError(writer.error?.localizedDescription ?? "Encoding failed")}
print("ENCODED", output.path)
