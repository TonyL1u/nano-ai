import ActivityKit

public struct ChatAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var question: String
    public var isPending: Bool
    public var isThinking: Bool
    public var isStreaming: Bool
    public var isAborted: Bool

    public init(
      question: String = "",
      isPending: Bool = true,
      isThinking: Bool = false,
      isStreaming: Bool = false,
      isAborted: Bool = false
    ) {
      self.question = question
      self.isPending = isPending
      self.isThinking = isThinking
      self.isStreaming = isStreaming
      self.isAborted = isAborted
    }
  }

  public let question: String
  public let model: String
}
